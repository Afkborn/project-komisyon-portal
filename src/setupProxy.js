const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const target =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8080/api";
  app.use(
    "/api",
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
    })
  );
};
