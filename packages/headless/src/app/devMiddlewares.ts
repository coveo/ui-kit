/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable node/no-unpublished-require */
import {Middleware} from 'redux';

/**
 * Modules dynamically added in development mode only
 */
export const devMiddlewares: Middleware[] = [];

if (process.env.NODE_ENV !== 'production') {
  devMiddlewares.push(require('redux-immutable-state-invariant').default());
}
