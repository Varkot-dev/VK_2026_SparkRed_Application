import { createApp } from '../server/dist/app.js';

/**
 * Vercel serverless entry. Every /api/* request is rewritten here (see vercel.json)
 * and handled by the same Express app the local dev server runs.
 */
export default createApp();
