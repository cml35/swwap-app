// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for web platform
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Ensure proper MIME types for web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Set proper Content-Type for bundle files
      if (req.url.endsWith('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      // Remove nosniff header for bundle files
      if (req.url.endsWith('.bundle')) {
        res.removeHeader('X-Content-Type-Options');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config; 