import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {fetchEventSource} from '../../../../utils/fetch-event-source/fetch.js';
import type {Message, StreamingStrategy} from './types.js';
import type {GeneratedAnswerServerState} from '../answer-generation-api-state.js';
import {serverStateEventHandler} from './server-state-event-handler/server-state-event-handler.js';

type StateWithConfiguration = {
  configuration: {
    accessToken: string;
  };
};
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
  strategy: StreamingStrategy<TState>
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
      Accept: 'application/json',
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
      serverStateEventHandler.handleError(error);
      strategy.handleError(error);
    },
    onmessage: (event) => {
      const message: Required<Message> = JSON.parse(event.data);
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
