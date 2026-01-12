// Logger utility for managing console output
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  }
};

// For production error tracking (optional)
export const logError = (error, context = '') => {
  if (isDevelopment) {
    console.error(`[ERROR] ${context}:`, error);
  } else {
    // In production, you might want to send to error tracking service
    // like Sentry, LogRocket, etc.
  }
};