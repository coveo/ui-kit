import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {EventSourcePolyfill} from 'event-source-polyfill';
import {AsyncThunkGeneratedAnswerOptions} from '../../api/generated-answer/generated-answer-client';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections';
import {validatePayload} from '../../utils/validate-payload';
import {buildStreamingRequest} from './generated-awswer-request';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  SearchSection &
  GeneratedAnswerSection;

const stringValue = new StringValue({required: true});
const booleanValue = new BooleanValue({required: true});

export const sseMessage = createAction(
  'generatedAnswer/sseReceived',
  (text: string) => validatePayload(text, stringValue)
);

export const sseError = createAction('generatedAnswer/sseError');

export const sseComplete = createAction('generatedAnswer/sseComplete');

export const resetAnswer = createAction('generatedAnswer/resetAnswer');

export const setIsLoading = createAction(
  'generatedAnswer/setIsLoading',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

interface StreamAnswerArgs {
  onMessage: (message: string) => void;
  onError: () => void;
  onCompleted: () => void;
  setEventSourceRef: (source: EventSourcePolyfill) => void;
}

export const streamAnswer = createAsyncThunk<
  void,
  StreamAnswerArgs,
  AsyncThunkGeneratedAnswerOptions<StateNeededByGeneratedAnswerStream>
>('generatedAnswer/streamAnswer', async (params, config) => {
  const state = config.getState();
  const {dispatch, extra} = config;

  const {onMessage, onError, onCompleted, setEventSourceRef} = params;

  const request = await buildStreamingRequest(state);

  dispatch(setIsLoading(true));
  const source = extra.streamingClient?.streamGeneratedAnswer(
    request,
    onMessage,
    onError,
    onCompleted
  );
  if (source) {
    setEventSourceRef(source);
  } else {
    dispatch(setIsLoading(false));
  }
});
