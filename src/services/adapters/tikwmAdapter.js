import { BaseAdapter, DownloaderServiceError } from './baseAdapter.js';
import { config } from '../../config/index.js';

export class TikwmAdapter extends BaseAdapter {
  constructor() {
    super('tikwm');
    this.apiUrl = 'https://www.tikwm.com/api/';
  }

  /**
   * Resolve TikTok video using TikWM API
   * @param {string} url
   */
  async resolve(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Origin': 'https://www.tikwm.com',
      'Referer': 'https://www.tikwm.com/',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'X-Requested-With': 'XMLHttpRequest'
    };

    try {
      let response;
      let lastStatus = 0;

      // Attempt 1: POST request with URLSearchParams
      try {
        const formData = new URLSearchParams();
        formData.append('url', url);
        formData.append('hd', '1');

        response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            ...browserHeaders,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: formData.toString(),
          signal: controller.signal
        });
        lastStatus = response.status;
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        response = null;
      }

      // Attempt 2: Fallback to GET request if POST was blocked (e.g. HTTP 403 / 502)
      if (!response || !response.ok) {
        try {
          const getUrl = `${this.apiUrl}?url=${encodeURIComponent(url)}&hd=1`;
          response = await fetch(getUrl, {
            method: 'GET',
            headers: browserHeaders,
            signal: controller.signal
          });
          lastStatus = response.status;
        } catch (err) {
          if (err.name === 'AbortError') throw err;
        }
      }

      if (!response || !response.ok) {
        throw new DownloaderServiceError(
          `Layanan penyedia TikWM merespons dengan status HTTP ${lastStatus || 502}`,
          502
        );
      }

      const json = await response.json();

      if (!json || json.code !== 0 || !json.data) {
        const errorMsg = json?.msg || 'Gagal memproses video. Pastikan video bersifat publik dan tidak dihapus.';
        throw new DownloaderServiceError(errorMsg, 422);
      }

      const data = json.data;
      const baseUrl = 'https://www.tikwm.com';

      const normalizeUrl = (link) => {
        if (!link) return null;
        if (link.startsWith('http://') || link.startsWith('https://')) return link;
        return `${baseUrl}${link.startsWith('/') ? '' : '/'}${link}`;
      };

      const videoId = data.id || Date.now().toString();
      const sanitizedTitle = (data.title || 'tiktok_video')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);

      const downloads = [];

      // HD Clean Video (Tanpa Watermark)
      const hdUrl = normalizeUrl(data.hdplay || data.play);
      if (hdUrl) {
        downloads.push({
          id: 'video_hd',
          format: 'mp4',
          label: 'Download Video HD',
          description: 'Kualitas tertinggi tanpa watermark',
          quality: 'HD',
          url: hdUrl,
          filename: `toksnap_${sanitizedTitle}_${videoId}_hd.mp4`
        });
      }

      // Standard Video (Jika berbeda)
      const standardUrl = normalizeUrl(data.play);
      if (standardUrl && standardUrl !== hdUrl) {
        downloads.push({
          id: 'video_sd',
          format: 'mp4',
          label: 'Download Video (SD)',
          description: 'Format standar file lebih hemat data',
          quality: 'SD',
          url: standardUrl,
          filename: `toksnap_${sanitizedTitle}_${videoId}.mp4`
        });
      }

      // Watermarked version (jika tersedia dan diminta pengguna)
      const wmUrl = normalizeUrl(data.wmplay);
      if (wmUrl) {
        downloads.push({
          id: 'video_wm',
          format: 'mp4',
          label: 'Download Video (Watermark)',
          description: 'Video asli dengan watermark resmi kreator',
          quality: 'Standard',
          url: wmUrl,
          filename: `toksnap_${sanitizedTitle}_${videoId}_wm.mp4`
        });
      }

      // Audio / Music (MP3)
      const musicUrl = normalizeUrl(data.music);
      if (musicUrl) {
        downloads.push({
          id: 'audio_mp3',
          format: 'mp3',
          label: 'Download Audio (MP3)',
          description: data.music_info?.title ? `Lagu: ${data.music_info.title}` : 'Ekstrak trek suara MP3 asli',
          quality: '128kbps',
          url: musicUrl,
          filename: `toksnap_${sanitizedTitle}_${videoId}_audio.mp3`
        });
      }

      // Image slides jika formatnya foto/slide TikTok
      if (Array.isArray(data.images) && data.images.length > 0) {
        data.images.forEach((imgUrl, index) => {
          const normImg = normalizeUrl(imgUrl);
          if (normImg) {
            downloads.push({
              id: `slide_${index + 1}`,
              format: 'jpg',
              label: `Download Slide Foto #${index + 1}`,
              description: `Foto slide resolusi asli`,
              quality: 'HD',
              url: normImg,
              filename: `toksnap_${sanitizedTitle}_slide_${index + 1}.jpg`
            });
          }
        });
      }

      return {
        id: videoId,
        title: data.title || 'Video TikTok',
        author: {
          name: data.author?.nickname || 'TikTok Creator',
          username: data.author?.unique_id || '',
          avatar: normalizeUrl(data.author?.avatar) || ''
        },
        cover: normalizeUrl(data.cover) || '',
        duration: typeof data.duration === 'number' ? data.duration : null,
        stats: {
          views: data.play_count ?? null,
          likes: data.digg_count ?? null,
          comments: data.comment_count ?? null,
          shares: data.share_count ?? null
        },
        downloads
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new DownloaderServiceError('Permintaan ke layanan TikTok timeout (waktu habis). Silakan coba beberapa saat lagi.', 504);
      }
      if (err instanceof DownloaderServiceError) {
        throw err;
      }
      throw new DownloaderServiceError(
        `Gagal menghubungi penyedia pemrosesan video: ${err.message}`,
        502
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
