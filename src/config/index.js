import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultAdapter: process.env.DEFAULT_ADAPTER || 'tikwm',
  rapidApiKey: process.env.RAPIDAPI_KEY || '',
  rapidApiHost: process.env.RAPIDAPI_HOST || 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10),
  },
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10)
};
