import { ValidationError } from '../validators/videoUrl.js';
import { DownloaderServiceError } from '../services/adapters/baseAdapter.js';
import { config } from '../config/index.js';

export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = 'Terjadi kesalahan pada server saat memproses permintaan.';

  if (err instanceof ValidationError) {
    statusCode = err.statusCode || 400;
    message = err.message;
  } else if (err instanceof DownloaderServiceError) {
    statusCode = err.statusCode || 502;
    message = err.message;
  } else if (err.status || err.statusCode) {
    statusCode = err.status || err.statusCode;
    message = err.message;
  }

  // Log error internally in non-production, omit sensitive details
  if (config.nodeEnv !== 'test') {
    console.error(`[Error] [${req.method} ${req.originalUrl}] ${statusCode}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code: statusCode,
    details: config.nodeEnv === 'development' && err.details ? err.details : undefined
  });
}
