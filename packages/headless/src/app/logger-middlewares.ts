import {SerializedError} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {Middleware} from 'redux';

export const logActionErrorMiddleware: (logger: Logger) => Middleware = (
  logger
) => () => (next) => (action) => {
  if (!action.error) {
    return next(action);
  }

  const error: SerializedError = action.error;

  logger.error(
    error.stack || error.message || error.name || 'Error',
    `Action dispatch error ${action.type}`,
    action
  );

  // Validation errors should prevent further dispatching
  if (action.error.name === 'SchemaValidationError') {
    return;
  }

  return next(action);
};

export const logActionMiddleware: (logger: Logger) => Middleware = (logger) => (
  api
) => (next) => (action) => {
  logger.debug(
    {
      action,
      nextState: api.getState(),
    },
    `Action dispatched: ${action.type}`
  );

  return next(action);
};
