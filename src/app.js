import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..', 'public');

export function createApp() {
  const app = express();

  // Basic security headers with relaxed directives for CDN images/media
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          mediaSrc: ["'self'", 'https:', 'blob:'],
          connectSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );

  app.use(cors());
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));

  // Serve static files with no-cache in dev to prevent browser caching stale pages
  app.use(express.static(publicPath, {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));

  // Mount API routes
  app.use('/api', apiRoutes);

  // 404 for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint API tidak ditemukan.',
      code: 404
    });
  });

  // Fallback to index.html for SPA/frontend navigation
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
