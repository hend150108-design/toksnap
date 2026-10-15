/**
 * Vercel Serverless Function Handler
 * Wraps TokSnap Express application for serverless deployment on Vercel.
 */
import express from 'express';
import { createApp } from '../src/app.js';

const app = createApp();

export default function handler(req, res) {
  return app(req, res);
}
