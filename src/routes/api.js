import { Router } from 'express';
import { validateTikTokUrl, ValidationError } from '../validators/videoUrl.js';
import { downloaderService } from '../services/downloader.js';
import { resolveRateLimiter, downloadRateLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/index.js';

const router = Router();

// Allowed CDN domains for safe binary download streaming
const ALLOWED_CDN_DOMAINS = [
  'tikwm.com',
  'tiktokcdn.com',
  'tiktokcdn-us.com',
  'byteoversea.com',
  'ibytedtos.com',
  'tiktok.com'
];

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'TokSnap API',
    activeAdapter: config.defaultAdapter,
    version: '1.0.0'
  });
});

/**
 * Resolve video URL endpoint
 * POST /api/resolve
 * Body: { url: string }
 */
router.post('/resolve', resolveRateLimiter, async (req, res, next) => {
  try {
    const { url } = req.body || {};

    if (!url) {
      throw new ValidationError('URL video TikTok wajib disertakan dalam request body.');
    }

    // 1. Strict validation & sanitization
    const validUrl = validateTikTokUrl(url);

    // 2. Resolve via downloader service adapter
    const videoData = await downloaderService.resolveVideo(validUrl);

    // 3. Attach safe proxy download URLs
    const enhancedDownloads = videoData.downloads.map((item) => {
      const encodedUrl = encodeURIComponent(item.url);
      const encodedFilename = encodeURIComponent(item.filename);
      return {
        ...item,
        downloadUrl: `/api/download?url=${encodedUrl}&filename=${encodedFilename}`
      };
    });

    // Find primary video for in-browser playback preview
    const primaryVideo = enhancedDownloads.find((d) => d.format === 'mp4') || enhancedDownloads[0];
    const previewUrl = primaryVideo
      ? `/api/download?url=${encodeURIComponent(primaryVideo.url)}&inline=1`
      : null;
    const directPreviewUrl = primaryVideo ? primaryVideo.url : null;

    res.json({
      success: true,
      data: {
        ...videoData,
        downloads: enhancedDownloads,
        previewUrl,
        directPreviewUrl
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Safe download proxy & streaming endpoint
 * Streams video/audio file with Content-Disposition (attachment or inline for playback)
 * GET /api/download?url=...&filename=...&inline=1
 */
router.get('/download', downloadRateLimiter, async (req, res, next) => {
  try {
    const rawUrl = req.query.url;
    const filename = req.query.filename || 'toksnap_download.mp4';
    const isInline = req.query.inline === 'true' || req.query.inline === '1';

    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).send('Parameter URL tidak valid.');
    }

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return res.status(400).send('Format URL tidak valid.');
    }

    // Enforce protocol
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return res.status(400).send('Protokol tidak diizinkan.');
    }

    // Strict CDN hostname check (prevent SSRF)
    const hostname = parsed.hostname.toLowerCase();
    const isAllowedCdn = ALLOWED_CDN_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedCdn) {
      return res.status(403).send('Domain download tidak diizinkan.');
    }

    // Sanitize filename to prevent header injection
    const cleanFilename = filename
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/^\.+/, '')
      .substring(0, 100);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s for streaming

    const upstreamHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://www.tiktok.com/'
    };

    // Forward range header for video player scrubbing/seeking
    if (req.headers.range) {
      upstreamHeaders['Range'] = req.headers.range;
    }

    const upstreamResponse = await fetch(parsed.toString(), {
      headers: upstreamHeaders,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      return res
        .status(502)
        .send(`Gagal mengambil media dari server upstream (${upstreamResponse.status}).`);
    }

    const contentType =
      upstreamResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = upstreamResponse.headers.get('content-length');
    const contentRange = upstreamResponse.headers.get('content-range');

    res.status(upstreamResponse.status);
    res.setHeader('Content-Type', contentType);

    if (isInline) {
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Accept-Ranges', 'bytes');
      if (contentRange) {
        res.setHeader('Content-Range', contentRange);
      }
    } else {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${cleanFilename}"`
      );
    }

    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Cache-Control', 'no-cache');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Cache-Control', 'no-cache');

    // Stream native body to client
    const reader = upstreamResponse.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(value);
        }
      } catch (err) {
        if (!res.headersSent) {
          res.status(500).send('Koneksi streaming terputus.');
        } else {
          res.end();
        }
      }
    };

    await pump();
  } catch (err) {
    next(err);
  }
});

export default router;
