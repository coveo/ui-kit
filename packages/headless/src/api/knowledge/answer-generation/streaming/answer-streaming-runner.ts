import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {fetchEventSource} from '../../../../utils/fetch-event-source/fetch.js';
import type {GeneratedAnswerServerState} from '../answer-generation-api-state.js';
import {serverStateEventHandler} from './server-state-event-handler/server-state-event-handler.js';
import type {MessageAlpha, StreamingStrategyAlpha} from './types.js';

type StateWithConfiguration = {
  configuration: {
    accessToken: string;
  };
};

/**
 * Streams answer generation from an endpoint using a specified strategy.
 *
 * Establishes a server-sent events connection to stream answer generation responses.
 * Coordinates between server state updates (via serverStateEventHandler) and
 * application-specific logic (via strategy handlers).
 *
 * @param endpointUrl - The streaming endpoint URL
 * @param args - Request arguments to send in the POST body
 * @param api - Redux toolkit query API with state getter, dispatch, and cache updater
 * @param strategy - Strategy defining application-specific event handlers
 */
export const streamAnswerWithStrategy = <
  TArgs,
  TState extends StateWithConfiguration,
>(
  endpointUrl: string,
  args: TArgs,
  api: {
    getState: () => TState;
    dispatch: ThunkDispatch<TState, unknown, UnknownAction>;
    updateCachedData: (
      updater: (draft: GeneratedAnswerServerState) => void
    ) => void;
  },
  // strategy: StreamingStrategy<TState> | StreamingStrategyAlpha<TState>
  strategy: StreamingStrategyAlpha<TState>
) => {
  const {dispatch, updateCachedData, getState} = api;
  const {
    configuration: {accessToken},
  } = getState();

  return fetchEventSource(endpointUrl, {
    method: 'POST',
    body: JSON.stringify(args),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'Accept-Encoding': '*',
    },
    fetch,
    onopen: async (response) => {
      serverStateEventHandler.handleOpen(response, updateCachedData);
      strategy.handleOpen(response, dispatch);
    },
    onclose: () => {
      strategy.handleClose?.(dispatch);
    },
    onerror: (error) => {
      strategy.handleError(error);
    },
    onmessage: (event) => {
      const message: MessageAlpha = JSON.parse(event.data);
      serverStateEventHandler.handleMessage.error?.(message, updateCachedData);
      strategy.handleMessage.error?.(message, dispatch);

      const messageType = message.payloadType;
      serverStateEventHandler.handleMessage[messageType]?.(
        message,
        updateCachedData
      );
      strategy.handleMessage[messageType]?.(message, dispatch);
    },
  });
};
