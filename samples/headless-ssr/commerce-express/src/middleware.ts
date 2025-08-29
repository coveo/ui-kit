import {randomUUID} from 'crypto';
import type {NextFunction, Request, Response} from 'express';

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  const uuid = randomUUID();

  req.headers['x-coveo-client-id'] = uuid;
  res.setHeader('x-coveo-client-id', uuid);
  res.setHeader('x-href', req.originalUrl);
  next();
};
