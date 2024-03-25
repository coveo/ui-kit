import {
  Action,
  Middleware,
  SerializedError,
  UnknownAction,
} from '@reduxjs/toolkit';
import {Logger} from 'pino';

type UnknownActionWithPossibleErrorPayload = UnknownAction & {
  payload?: {ignored?: boolean};
  error?: SerializedError;
};

export const logActionErrorMiddleware: (logger: Logger) => Middleware =
  (logger) => () => (next) => (action) => {
    const unknownAction = action as UnknownActionWithPossibleErrorPayload;
    if (!unknownAction.error) {
      return next(action);
    }

    const error: SerializedError = unknownAction.error;

    if (!unknownAction.payload?.ignored) {
      logger.error(
        error.stack || error.message || error.name || 'Error',
        `Action dispatch error ${unknownAction.type}`,
        action
      );
    }

    // Validation errors should prevent further dispatching
    if (unknownAction.error.name === 'SchemaValidationError') {
      return;
    }

    return next(action);
  };

export const logActionMiddleware: (logger: Logger) => Middleware =
  (logger) => (api) => (next) => (action) => {
    logger.debug(
      {
        action,
        nextState: api.getState(),
      },
      `Action dispatched: ${(action as Action).type}`
    );

    return next(action);
  };
