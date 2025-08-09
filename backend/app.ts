import express from 'express';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      name: 'backend',
      status: 'ok',
      version: '1.0',
      now: 'redacted', // stable for snapshot
    });
  });

  app.post('/echo', (req, res) => {
    res.json({ youSent: req.body, received: true });
  });

  return app;
}