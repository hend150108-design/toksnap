import express from 'express';
import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

export default app;

if (!process.env.VERCEL) {
  const server = app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`🚀 TokSnap Server is running!`);
    console.log(`🌐 URL: http://localhost:${config.port}`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log(`🔌 Active Adapter: ${config.defaultAdapter}`);
    console.log(`🛡️  Rate Limit: ${config.rateLimit.maxRequests} req / ${config.rateLimit.windowMs / 1000}s`);
    console.log(`=========================================`);
  });

  // Graceful shutdown
  const handleExit = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down TokSnap gracefully...`);
    server.close(() => {
      console.log('Server closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleExit('SIGINT'));
  process.on('SIGTERM', () => handleExit('SIGTERM'));
}
