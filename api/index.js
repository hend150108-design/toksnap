/**
 * Vercel Serverless Function Handler
 * Wraps TokSnap Express application for serverless deployment on Vercel.
 */
import { createApp } from '../src/app.js';

const app = createApp();

export default app;
