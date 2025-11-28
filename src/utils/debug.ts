/**
 * Debug utility for development
 * Helps track authentication flow and API calls
 */

const DEBUG = import.meta.env.DEV; // Only in development

export const debugLog = (category: string, message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[${category}]`, message, data || '');
  }
};

export const debugError = (category: string, message: string, error: any) => {
  if (DEBUG) {
    console.error(`[${category} ERROR]`, message, error);
  }
};

export const debugAuth = (message: string, data?: any) => {
  debugLog('AUTH', message, data);
};

export const debugAPI = (message: string, data?: any) => {
  debugLog('API', message, data);
};

