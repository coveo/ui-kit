import {StringValue} from '@coveo/bueno';
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

export const sseMessage = createAction(
  'generatedAnswer/sseReceived',
  (text: string) => validatePayload(text, stringValue)
);

export const sseError = createAction('generatedAnswer/sseError');

export const sseComplete = createAction('generatedAnswer/sseComplete');

export const resetAnswer = createAction('generatedAnswer/resetAnswer');

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

  const {onMessage, onError, onCompleted, setEventSourceRef} = params;
  const {streamingClient} = config.extra;

  const request = await buildStreamingRequest(state);

  const source = streamingClient?.streamGeneratedAnswer(
    request,
    onMessage,
    onError,
    onCompleted
  );
  if (source) {
    setEventSourceRef(source);
  }
});
