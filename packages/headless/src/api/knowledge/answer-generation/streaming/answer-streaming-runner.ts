import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {fetchEventSource} from '../../../../utils/fetch-event-source/fetch.js';
import type {Message, StreamingStrategy} from './strategies/types.js';

type StateWithConfiguration = {
  configuration: {
    accessToken: string;
  };
};
export const streamAnswerWithStrategy = <
  TArgs,
  TState extends StateWithConfiguration,
  TDraft,
>(
  args: TArgs,
  api: {
    getState: () => TState;
    dispatch: ThunkDispatch<TState, unknown, UnknownAction>;
    updateCachedData: (updater: (draft: TDraft) => void) => void;
  },
  strategy: StreamingStrategy<TDraft, TState>
) => {
  const {getState, dispatch, updateCachedData} = api;
  const state = getState();
  const endpointUrl = strategy.buildEndpointUrl(state);
  const {
    configuration: {accessToken},
  } = state;

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
      strategy.events.handleOpen(response, updateCachedData, dispatch);
    },
    onclose: () => {
      strategy.events.handleClose(updateCachedData, dispatch);
    },
    onerror: (error) => {
      strategy.events.handleError(error);
    },
    onmessage: (event) => {
      const message: Required<Message> = JSON.parse(event.data);
      strategy.events.handleMessage.error?.(
        message,
        updateCachedData,
        dispatch
      );

      const messageType = message.payloadType;
      strategy.events.handleMessage[messageType]?.(
        message,
        updateCachedData,
        dispatch
      );
    },
  });
};
