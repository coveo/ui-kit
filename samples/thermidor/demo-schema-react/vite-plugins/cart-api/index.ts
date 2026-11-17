import type {Plugin} from 'vite';
import {createCartApiMiddleware} from './cart-api-middleware.js';

export function cartApi(): Plugin {
  return {
    name: 'demo-cart-api',
    configureServer(server) {
      server.middlewares.use(createCartApiMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createCartApiMiddleware());
    },
  };
}
