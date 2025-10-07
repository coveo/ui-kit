import {randomUUID} from 'node:crypto';
import type {NextFunction, Request, Response} from 'express';

/**
 * Express middleware to inject Coveo-specific headers for SSR analytics and context.
 *
 * - Sets a unique client ID (`x-coveo-client-id`) on both the request and response.
 * - Sets the current page URL (`x-href`) on the response.
 *
 * Why middleware?
 * - Ensures these headers are consistently set for every request, regardless of route.
 * - Centralizes logic, making it easier to maintain and less error-prone than duplicating on each page/route.
 * - Guarantees analytics and context are always available for SSR and client-side hydration.
 */
export const middleware = (req: Request, res: Response, next: NextFunction) => {
  const uuid = randomUUID();

  req.headers['x-coveo-client-id'] = uuid;
  res.setHeader('x-coveo-client-id', uuid);
  res.setHeader('x-href', req.originalUrl);
  next();
};
