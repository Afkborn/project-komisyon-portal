const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const target =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:2626/api";

  app.use(
    "/api",
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      pathRewrite: {
        "^/komisyon-portal/api": "/api", // komisyon-portal prefix'ini kaldır
        "^/api": "/api", // normal /api istekleri için
      },
    })
  );
};
