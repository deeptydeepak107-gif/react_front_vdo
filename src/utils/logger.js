// src/utils/logger.js
// Production-safe logger utility
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[LOG]', ...args);
    }
  },
  
  error: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ERROR]', ...args);
    } else {
      // In production, you can send errors to your logging service
      console.error('[ERROR]', ...args);
    }
  },
  
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WARN]', ...args);
    }
  },
  
  info: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[INFO]', ...args);
    }
  }
};