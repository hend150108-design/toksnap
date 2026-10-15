import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './src/app.js';
import { config } from './src/config/index.js';

const app = createApp();

// Export for Vercel Serverless / Express framework preset
export default app;

// Only start HTTP listener when run directly (e.g. `node index.js`), never when imported by Vercel
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (!process.env.VERCEL && isDirectExecution) {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 TokSnap Server is running!`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log(`🔌 Active Adapter: ${config.defaultAdapter}`);
    console.log(`🛡️  Rate Limit: ${config.rateLimit.maxRequests} req / ${config.rateLimit.windowMs / 1000}s`);
    console.log(`=========================================`);
  });
}
