import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { validateTikTokUrl, ValidationError } from '../src/validators/videoUrl.js';
import { RapidApiAdapter } from '../src/services/adapters/rapidApiAdapter.js';
import { downloaderService } from '../src/services/downloader.js';
import { createApp } from '../src/app.js';

describe('1. TikTok URL Validator & SSRF Prevention', () => {
  test('should accept valid standard TikTok video URL', () => {
    const input = 'https://www.tiktok.com/@creator_official/video/7189123456789012345?is_from_webapp=1';
    const result = validateTikTokUrl(input);
    assert.ok(result.startsWith('https://www.tiktok.com/@creator_official/video/7189123456789012345'));
  });

  test('should accept valid short TikTok vt link', () => {
    const input = 'https://vt.tiktok.com/ZS8ABCDE/';
    const result = validateTikTokUrl(input);
    assert.equal(result, 'https://vt.tiktok.com/ZS8ABCDE/');
  });

  test('should accept valid short TikTok vm link', () => {
    const input = 'https://vm.tiktok.com/ZM8XYZ/';
    const result = validateTikTokUrl(input);
    assert.equal(result, 'https://vm.tiktok.com/ZM8XYZ/');
  });

  test('should reject empty or missing URL', () => {
    assert.throws(() => validateTikTokUrl(''), {
      name: 'ValidationError',
      message: 'URL video TikTok wajib diisi.'
    });
  });

  test('should reject invalid URL format', () => {
    assert.throws(() => validateTikTokUrl('bukan-sebuah-url'), {
      name: 'ValidationError'
    });
  });

  test('should reject unsupported domains (e.g. YouTube or arbitrary websites)', () => {
    assert.throws(() => validateTikTokUrl('https://www.youtube.com/watch?v=12345'), {
      name: 'ValidationError'
    });
  });

  test('SSRF: should block localhost and loopback addresses', () => {
    assert.throws(() => validateTikTokUrl('http://localhost/video/123'), (err) => {
      return err.statusCode === 403;
    });

    assert.throws(() => validateTikTokUrl('http://127.0.0.1/video/123'), (err) => {
      return err.statusCode === 403;
    });
  });

  test('SSRF: should block internal private IP ranges', () => {
    assert.throws(() => validateTikTokUrl('http://192.168.1.1/video/123'), (err) => {
      return err.statusCode === 403;
    });

    assert.throws(() => validateTikTokUrl('http://169.254.169.254/latest/meta-data'), (err) => {
      return err.statusCode === 403;
    });
  });

  test('should reject non-http/https protocols', () => {
    assert.throws(() => validateTikTokUrl('ftp://tiktok.com/video/123'), {
      name: 'ValidationError'
    });
  });
});

describe('2. Downloader Adapters & Service', () => {
  test('RapidApiAdapter throws explicit configuration error when API key is missing', async () => {
    const adapter = new RapidApiAdapter();
    // Ensure key is empty for this test
    adapter.apiKey = '';

    await assert.rejects(
      async () => {
        await adapter.resolve('https://www.tiktok.com/@user/video/123456');
      },
      (err) => {
        return (
          err.name === 'DownloaderServiceError' &&
          err.statusCode === 500 &&
          err.message.includes('RAPIDAPI_KEY belum dikonfigurasi')
        );
      }
    );
  });

  test('DownloaderService can retrieve registered adapter and handle unknown adapter', () => {
    const tikwm = downloaderService.getAdapter('tikwm');
    assert.ok(tikwm);
    assert.equal(tikwm.name, 'tikwm');

    assert.throws(() => downloaderService.getAdapter('unknown_adapter'), {
      name: 'DownloaderServiceError'
    });
  });
});

describe('3. API Server Integration Endpoints', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /api/health should return status ok with activeAdapter', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.status, 'ok');
    assert.ok(json.activeAdapter);
    assert.ok(typeof json.uptime === 'number');
  });

  test('POST /api/resolve with empty body should return 400', async () => {
    const res = await fetch(`${baseUrl}/api/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.error.includes('wajib disertakan'));
  });

  test('POST /api/resolve with unsupported domain should return 400', async () => {
    const res = await fetch(`${baseUrl}/api/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/not-tiktok' })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.error.includes('Domain tidak didukung'));
  });

  test('POST /api/resolve with SSRF localhost attempt should return 403', async () => {
    const res = await fetch(`${baseUrl}/api/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://127.0.0.1:8080/admin' })
    });

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.error.includes('SSRF'));
  });

  test('GET /api/download without url query parameter should return 400', async () => {
    const res = await fetch(`${baseUrl}/api/download`);
    assert.equal(res.status, 400);
  });

  test('GET /api/download with unauthorized domain should return 403 (SSRF protection)', async () => {
    const res = await fetch(`${baseUrl}/api/download?url=https://attacker-server.com/malicious.mp4`);
    assert.equal(res.status, 403);
  });

  test('GET /api/undefined_endpoint should return 404 JSON', async () => {
    const res = await fetch(`${baseUrl}/api/undefined_endpoint`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.success, false);
  });
});
