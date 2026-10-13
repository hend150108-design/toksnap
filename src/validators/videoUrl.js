/**
 * Validates and sanitizes TikTok URLs with strict SSRF & domain checks.
 */

const ALLOWED_HOSTNAMES = new Set([
  'tiktok.com',
  'www.tiktok.com',
  'm.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'v.douyin.com'
]);

// IP regex checks for IPv4 and IPv6
const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^\[?[a-fA-F0-9:]+\]?$/;

export class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

/**
 * Validates a video URL from user input.
 * @param {string} inputUrl - The raw input URL
 * @returns {string} - The sanitized, validated URL string
 * @throws {ValidationError}
 */
export function validateTikTokUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new ValidationError('URL video TikTok wajib diisi.');
  }

  const trimmed = inputUrl.trim();
  if (trimmed.length > 2048) {
    throw new ValidationError('URL terlalu panjang (maksimum 2048 karakter).');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new ValidationError('Format URL tidak valid. Pastikan menyertakan https://');
  }

  // 1. Enforce HTTPS / HTTP protocol
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new ValidationError('Protokol URL tidak didukung. Hanya http dan https yang diizinkan.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 2. Reject direct IPs, loopbacks, internal hosts (SSRF prevention)
  if (
    IP_REGEX.test(hostname) ||
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('169.254.') ||
    hostname.includes('0.0.0.0')
  ) {
    throw new ValidationError('Akses ke alamat IP atau host internal dilarang (keamanan SSRF).', 403);
  }

  // 3. Match against allowed domain list
  const isAllowedHost = Array.from(ALLOWED_HOSTNAMES).some((allowed) => {
    return hostname === allowed || hostname.endsWith(`.${allowed}`);
  });

  if (!isAllowedHost) {
    throw new ValidationError(
      'Domain tidak didukung. TokSnap hanya memproses URL dari tiktok.com (termasuk vt.tiktok.com dan vm.tiktok.com).'
    );
  }

  // 4. Validate path structure
  const path = parsedUrl.pathname;
  const isShortLink = (hostname === 'vt.tiktok.com' || hostname === 'vm.tiktok.com' || path.startsWith('/t/')) && path.length > 1;
  const isVideoPath = path.includes('/video/') || path.includes('/v/');
  const isPhotoPath = path.includes('/photo/');

  if (!isShortLink && !isVideoPath && !isPhotoPath) {
    throw new ValidationError(
      'Format link TikTok tidak dikenali. Masukkan link video TikTok yang valid (contoh: https://www.tiktok.com/@user/video/123456789 atau https://vt.tiktok.com/ZS...)'
    );
  }

  return parsedUrl.toString();
}
