import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {EventSourcePolyfill} from 'event-source-polyfill';
import {AsyncThunkGeneratedAnswerOptions} from '../../api/generated-answer/generated-answer-client';
import {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerMessagePayload,
} from '../../api/generated-answer/generated-answer-event-payload';
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
const optionalStringValue = new StringValue();
const booleanValue = new BooleanValue({required: true});
const citationSchema = {
  id: stringValue,
  title: stringValue,
  uri: stringValue,
  permanentid: stringValue,
  clickUri: optionalStringValue,
};

export interface SSEErrorPayload {
  message?: string;
  code?: number;
}

export const updateMessage = createAction(
  'generatedAnswer/updateMessage',
  (payload: GeneratedAnswerMessagePayload) =>
    validatePayload(payload, {
      textDelta: stringValue,
    })
);

export const updateCitations = createAction(
  'generatedAnswer/updateCitations',
  (payload: GeneratedAnswerCitationsPayload) =>
    validatePayload(payload, {
      citations: new ArrayValue({
        required: true,
        each: new RecordValue({
          values: citationSchema,
        }),
      }),
    })
);

export const updateError = createAction(
  'generatedAnswer/updateError',
  (payload: SSEErrorPayload) =>
    validatePayload(payload, {
      message: new StringValue({required: false}),
      code: new NumberValue({min: 0}),
    })
);

export const resetAnswer = createAction('generatedAnswer/resetAnswer');

export const likeGeneratedAnswer = createAction('generatedAnswer/like');

export const dislikeGeneratedAnswer = createAction('generatedAnswer/dislike');

export const setIsLoading = createAction(
  'generatedAnswer/setIsLoading',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

interface StreamAnswerArgs {
  setEventSourceRef: (source: EventSourcePolyfill) => void;
}

export const streamAnswer = createAsyncThunk<
  void,
  StreamAnswerArgs,
  AsyncThunkGeneratedAnswerOptions<StateNeededByGeneratedAnswerStream>
>('generatedAnswer/streamAnswer', async (params, config) => {
  const state = config.getState();
  const {dispatch, extra} = config;

  const {setEventSourceRef} = params;

  const request = await buildStreamingRequest(state);

  const onMessage = (payload: GeneratedAnswerMessagePayload) =>
    dispatch(updateMessage(payload));

  const onCitations = (payload: GeneratedAnswerCitationsPayload) =>
    dispatch(updateCitations(payload));

  const onError = (error: SSEErrorPayload) => {
    source?.close();
    dispatch(updateError(error));
  };

  const onCompleted = () => {
    source?.close();
    dispatch(setIsLoading(false));
  };

  dispatch(setIsLoading(true));
  const source = extra.streamingClient?.streamGeneratedAnswer(
    request,
    onMessage,
    onCitations,
    onError,
    onCompleted
  );
  if (source) {
    setEventSourceRef(source);
  } else {
    dispatch(setIsLoading(false));
  }
});
