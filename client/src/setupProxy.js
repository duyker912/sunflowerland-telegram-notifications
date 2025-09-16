const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://sunflowerland-telegram-notifications-production.up.railway.app',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug'
    })
  );
};
