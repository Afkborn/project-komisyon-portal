const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // REACT_APP_BACKEND_URL: örn. http://localhost:3434
  // Not: Bazı ortamlarda yanlışlıkla /api ile set edilebiliyor; çift /api olmaması için normalize ediyoruz.
  const rawTarget = process.env.REACT_APP_BACKEND_URL || "http://localhost:2626";
  const target = rawTarget.replace(/\/?api\/?$/, "");

  // Context'i createProxyMiddleware'e veriyoruz ki path '/api/...' olarak korunabilsin.
  // Aksi halde Express mount path'i kırpıp backend'e '/users/login' gibi gidebiliyor.
  app.use(
    createProxyMiddleware(["/api", "/komisyon-portal/api"], {
      target,
      changeOrigin: true,
      pathRewrite: {
        "^/komisyon-portal/api": "/api",
      },
    })
  );
};
