// client/server.ts
// Minimal Express server to serve the SPA and proxy /api to the API container.

import express, { Request, Response } from 'express';
import path from 'path';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Config
const PORT = parseInt(process.env.PORT || '3000', 10);
// Internal DNS name of the API container in Lightsail:
const API_TARGET = process.env.API_TARGET || 'http://server:3000';

// gzip responses
app.use(compression());

// Proxy /api to the server container
const apiProxy = createProxyMiddleware<Request, Response>({
  target: API_TARGET,
  changeOrigin: false,
  ws: true,
  // v3: subscribe to events via the `on` object
  on: {
    error: (err, _req, res) => {
      console.error('API proxy error:', err?.message || err);
      // Only send a response if 'res' is an Express Response and headers are not sent
      if (res instanceof express.response.constructor && !(res as Response).headersSent) {
        (res as Response).status(502).json({ error: 'Bad Gateway', detail: 'Cannot reach API upstream' });
      }
    },
  },
});

app.use('/api', apiProxy);

// Health endpoint for container checks
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
});

// Serve built SPA from ../dist (this file compiles to /app/build)
const distDir = path.resolve(__dirname, '../dist');
app.use(express.static(distDir, { index: false }));

// SPA fallback
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Client (SPA) server listening on http://0.0.0.0:${PORT}`);
  console.log(`   Proxying /api -> ${API_TARGET}`);
});
