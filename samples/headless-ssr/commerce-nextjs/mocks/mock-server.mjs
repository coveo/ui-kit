import express from 'express';
import {createMiddleware} from '@mswjs/http-middleware';
import {MockCommerceApi} from '@coveo/platform-mock-api';

const port = Number.parseInt(process.env.MOCK_API_PORT ?? '9090', 10);
const baseUrl = `http://localhost:${port}`;

const api = new MockCommerceApi(baseUrl);
const app = express();

// The app and this server run on different ports, so client-side calls are
// cross-origin. Without these headers the browser rejects every response and the
// engine silently falls back to whatever state the server already rendered.
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});
app.options('*splat', (_req, res) => res.sendStatus(204));

// Playwright polls this route to know when the server is ready.
app.get('/health', (_req, res) => res.status(200).send('ok'));
// Load mocks
app.use(createMiddleware(...api.handlers));

app.listen(port, () => console.log(`Mock API server running at ${baseUrl}`));
