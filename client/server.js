import express from 'express';
import { join } from 'path';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Config
const PORT = parseInt(process.env.PORT || '3000', 10);
// API_TARGET is the internal address of the server container inside Lightsail network
// Keep default; override with env if needed.
const API_TARGET = process.env.API_TARGET || 'http://server:3000';

// gzip responses
app.use(compression());

// Proxy API to server container
app.use(
  '/api',
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: false,
    ws: true,
    // keep original /api path
    pathRewrite: (pathReq) => pathReq,
    proxyTimeout: 60000,
    onError(err, req, res) {
      console.error('API proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Bad Gateway', detail: 'Cannot reach API upstream' });
      }
    },
  })
);

// Health endpoint for container health checks
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
});

// Serve static SPA from /dist
const distDir = join(__dirname, 'dist');
app.use(express.static(distDir, { index: false }));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Client (SPA) server listening on http://0.0.0.0:${PORT}`);
  console.log(`   Proxying /api -> ${API_TARGET}`);
});
