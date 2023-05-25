import {StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {EventSourcePolyfill} from 'event-source-polyfill';
import {AsyncThunkGeneratedAnswerOptions} from '../../api/search/generated-answer/generated-answer-client';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
} from '../../state/state-sections';
import {validatePayload} from '../../utils/validate-payload';
import {GeneratedAnswerAction} from '../analytics/analytics-utils';
import {buildStreamingRequest} from './generated-awswer-request';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  GeneratedAnswerSection;

const stringValue = new StringValue({required: true});

export const sseMessage = createAction(
  'generatedAnswer/sseReceived',
  (text: string) => validatePayload(text, stringValue)
);

export const sseError = createAction('generatedAnswer/sseError');

export const sseComplete = createAction('generatedAnswer/sseComplete');

export const resetAnswer = createAction('generatedAnswer/resetAnswer');

interface StreamAnswerArgs {
  streamingAction: GeneratedAnswerAction;
  onMessage: (message: string) => void;
  onError: (message?: string) => void;
  onCompleted: () => void;
  setEventSourceRef: (source: EventSourcePolyfill) => void;
}

export const streamAnswer = createAsyncThunk<
  void,
  StreamAnswerArgs,
  AsyncThunkGeneratedAnswerOptions<StateNeededByGeneratedAnswerStream>
>('generatedAnswer/streamAnswer', async (params, config) => {
  const state = config.getState();

  const {onMessage, onError, onCompleted, setEventSourceRef} = params;
  const {apiClient} = config.extra;

  const request = await buildStreamingRequest(state);

  const source = apiClient.streamGeneratedAnswer(
    request,
    onMessage,
    onError,
    onCompleted
  );
  if (source) {
    setEventSourceRef(source);
  }
});
