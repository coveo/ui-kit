import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkGeneratedAnswerOptions} from '../../api/generated-answer/generated-answer-client';
import {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerMessagePayload,
  GeneratedAnswerPayloadType,
  GeneratedAnswerStreamEventData,
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

export interface GeneratedAnswerErrorPayload {
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
  (payload: GeneratedAnswerErrorPayload) =>
    validatePayload(payload, {
      message: optionalStringValue,
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
  setAbortControllerRef: (ref: AbortController) => void;
}

export const streamAnswer = createAsyncThunk<
  void,
  StreamAnswerArgs,
  AsyncThunkGeneratedAnswerOptions<StateNeededByGeneratedAnswerStream>
>('generatedAnswer/streamAnswer', async (params, config) => {
  const state = config.getState();
  const {dispatch, extra} = config;

  const {setAbortControllerRef} = params;

  const request = await buildStreamingRequest(state);

  const handleStreamPayload = (
    payloadType: GeneratedAnswerPayloadType,
    payload: string
  ) => {
    if (payloadType === 'genqa.messageType') {
      dispatch(
        updateMessage(JSON.parse(payload) as GeneratedAnswerMessagePayload)
      );
    } else if (payloadType === 'genqa.citationsType') {
      dispatch(
        updateCitations(JSON.parse(payload) as GeneratedAnswerCitationsPayload)
      );
    } else {
      extra.logger.error(`Unknown payloadType: "${payloadType}"`);
    }
  };

  dispatch(setIsLoading(true));
  const abortController = extra.streamingClient?.streamGeneratedAnswer(
    request,
    {
      write: (data: GeneratedAnswerStreamEventData) => {
        if (data.payload && data.payloadType) {
          handleStreamPayload(data.payloadType, data.payload);
        }
      },
      abort: (
        error: GeneratedAnswerErrorPayload,
        abortController: AbortController
      ) => {
        abortController.abort();
        dispatch(updateError(error));
      },
      setIsLoading: (isLoading) => dispatch(setIsLoading(isLoading)),
      resetAnswer: () => dispatch(resetAnswer()),
    }
  );
  if (abortController) {
    setAbortControllerRef(abortController);
  } else {
    dispatch(setIsLoading(false));
  }
});
