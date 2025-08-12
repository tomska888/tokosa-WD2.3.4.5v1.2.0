// client/server.ts
// Minimal Express server to serve the SPA and proxy /api to the API container.

import express from 'express';
import path from 'path';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Socket } from 'net';

const app = express();

// Config
const PORT = parseInt(process.env.PORT || '3000', 10);
// Internal DNS name of the API container in Lightsail:
const API_TARGET = process.env.API_TARGET || 'http://server:3000';

// gzip responses
app.use(compression());

// Proxy /api to the server container (v3: use `on` for events)
const apiProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: false,
  ws: true,
  on: {
    error: (err: Error, _req: IncomingMessage, res: ServerResponse<IncomingMessage> | Socket) => {
      console.error('API proxy error:', err?.message || err);

      try {
        // HTTP response path
        if ('setHeader' in res) {
          const r = res as ServerResponse<IncomingMessage>;
          if (!r.headersSent) {
            r.statusCode = 502;
            r.setHeader('Content-Type', 'application/json');
            r.end(JSON.stringify({ error: 'Bad Gateway', detail: 'Cannot reach API upstream' }));
            return;
          }
        }
        // WebSocket/upgrade or headers already sent
        (res as Socket).end();
      } catch {
        /* no-op */
      }
    },
  },
});

app.use('/api', apiProxy);

// Health endpoint for container checks
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
});

// Serve built SPA from ../dist (this file compiles to /app/build)
const distDir = path.resolve(__dirname, '../dist');
app.use(express.static(distDir, { index: false }));

// SPA fallback (Express 5: use '/*' instead of '*' to avoid path-to-regexp error)
app.get('/*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Client (SPA) server listening on http://0.0.0.0:${PORT}`);
  console.log(`   Proxying /api -> ${API_TARGET}`);
});
