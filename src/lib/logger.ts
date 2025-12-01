/**
 * Structured logging using Pino
 * Safe for Next.js API routes (no worker threads)
 */

import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

// Create logger without pino-pretty transport to avoid worker thread issues in Next.js
// pino-pretty uses workers which can cause "worker has exited" errors in Next.js API routes
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Don't use transport in Next.js - it causes worker thread issues
  // In development, logs will still be readable JSON
  // For prettier logs, use: LOG_LEVEL=debug node -r pino-pretty/register your-script.js
});

export type Logger = typeof logger;

