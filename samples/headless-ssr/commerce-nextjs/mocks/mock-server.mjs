import express from 'express';
import {createMiddleware} from '@mswjs/http-middleware';
import {MockCommerceApi} from '@coveo/platform-mock-api';

const port = 9090;
const baseUrl = `http://localhost:${port}`;

const api = new MockCommerceApi(baseUrl);
const app = express();

// Playwright polls this route to know when the server is ready.
app.get('/health', (_req, res) => res.status(200).send('ok'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} -> ${res.statusCode}`
    );
  });
  next();
});

app.use(createMiddleware(...api.handlers));

app.listen(port, () => console.log(`Mock API server running at ${baseUrl}`));
