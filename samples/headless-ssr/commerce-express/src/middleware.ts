import {randomUUID} from 'node:crypto';
import type {NextFunction, Request, Response} from 'express';

/**
 * Ensures every request carries a Coveo client ID.
 *
 * `getNavigatorContext` reads the `x-coveo-client-id` request header when
 * building the navigator context for analytics and personalization (see
 * `lib/navigatorContext.ts`). Setting it here — once, for every route — keeps
 * that concern out of the individual handlers.
 *
 * A real storefront would persist this ID in a cookie so it stays stable for a
 * returning visitor; the sample generates one per request when the client
 * doesn't already provide one.
 */
export const middleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.headers['x-coveo-client-id']) {
    req.headers['x-coveo-client-id'] = randomUUID();
  }
  next();
};
