import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const resolveRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: 'Terlalu banyak permintaan dalam waktu singkat. Harap tunggu 1 menit sebelum mencoba kembali.',
    code: 429
  }
});

export const downloadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  skip: (req) => Boolean((req.query.inline === '1' || req.query.inline === 'true') && req.headers.range),
  message: {
    success: false,
    error: 'Batas download tercapai. Harap tunggu sebentar.',
    code: 429
  }
});
