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
  GeneratedAnswerEndOfStreamPayload,
  GeneratedAnswerMessagePayload,
  GeneratedAnswerPayloadType,
  GeneratedAnswerStreamEventData,
} from '../../api/generated-answer/generated-answer-event-payload';
import {
  ConfigurationSection,
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections';
import {validatePayload} from '../../utils/validate-payload';
import {logGeneratedAnswerStreamEnd} from './generated-answer-analytics-actions';
import {buildStreamingRequest} from './generated-answer-request';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  SearchSection &
  GeneratedAnswerSection &
  DebugSection;

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

export const setIsStreaming = createAction(
  'generatedAnswer/setIsStreaming',
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
    switch (payloadType) {
      case 'genqa.messageType':
        dispatch(
          updateMessage(JSON.parse(payload) as GeneratedAnswerMessagePayload)
        );
        break;
      case 'genqa.citationsType':
        dispatch(
          updateCitations(
            JSON.parse(payload) as GeneratedAnswerCitationsPayload
          )
        );
        break;
      case 'genqa.endOfStreamType':
        dispatch(setIsStreaming(false));
        dispatch(
          logGeneratedAnswerStreamEnd(
            (JSON.parse(payload) as GeneratedAnswerEndOfStreamPayload)
              .answerGenerated
          )
        );
        break;
      default:
        if (state.debug) {
          extra.logger.warn(`Unknown payloadType: "${payloadType}"`);
        }
    }
  };

  dispatch(setIsLoading(true));
  const abortController = extra.streamingClient?.streamGeneratedAnswer(
    request,
    {
      write: (data: GeneratedAnswerStreamEventData) => {
        if (
          request.streamId ===
          state.search.extendedResults.generativeQuestionAnsweringId
        ) {
          dispatch(setIsLoading(false));
          if (data.payload && data.payloadType) {
            handleStreamPayload(data.payloadType, data.payload);
          }
        }
      },
      abort: (error: GeneratedAnswerErrorPayload) => {
        if (
          request.streamId ===
          state.search.extendedResults.generativeQuestionAnsweringId
        ) {
          dispatch(updateError(error));
        }
      },
      close: () => {
        if (
          request.streamId ===
          state.search.extendedResults.generativeQuestionAnsweringId
        ) {
          dispatch(setIsStreaming(false));
        }
      },
      resetAnswer: () => {
        if (
          request.streamId ===
          state.search.extendedResults.generativeQuestionAnsweringId
        ) {
          dispatch(resetAnswer());
        }
      },
    }
  );
  if (abortController) {
    setAbortControllerRef(abortController);
  } else {
    dispatch(setIsLoading(false));
  }
});
