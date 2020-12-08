import {SchemaValidationError} from '@coveo/bueno';
import {Logger} from 'pino';
import {Middleware} from 'redux';

export const logActionErrorMiddleware: (logger: Logger) => Middleware = (
  logger
) => () => (next) => (action) => {
  if (!action.error) {
    return next(action);
  }

  const error =
    typeof action.error === typeof SchemaValidationError
      ? action.error
      : action.error.message;
  logger.error(error, `Action dispatch error ${action.type}`, action);
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
