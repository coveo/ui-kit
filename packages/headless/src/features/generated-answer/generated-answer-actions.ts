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
import {GeneratedAnswerStreamRequest} from '../../api/generated-answer/generated-answer-request';
import {
  nonEmptyString,
  nonEmptyStringArray,
  validatePayload,
} from '../../utils/validate-payload';
import {logGeneratedAnswerStreamEnd} from './generated-answer-analytics-actions';
import {
  StateNeededByGeneratedAnswerStream,
  buildStreamingRequest,
} from './generated-answer-request';
import {
  GeneratedAnswerStyle,
  GeneratedResponseFormat,
  generatedAnswerStyle,
} from './generated-response-format';

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

export const setIsVisible = createAction(
  'generatedAnswer/setIsVisible',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

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

export const openGeneratedAnswerFeedbackModal = createAction(
  'generatedAnswer/feedbackModal/open'
);

export const setId = createAction(
  'generatedAnswer/setId',
  (payload: {id: string}) =>
    validatePayload(payload, {
      id: new StringValue({
        required: true,
      }),
    })
);

export const closeGeneratedAnswerFeedbackModal = createAction(
  'generatedAnswer/feedbackModal/close'
);

export const sendGeneratedAnswerFeedback = createAction(
  'generatedAnswer/sendFeedback'
);

export const setIsLoading = createAction(
  'generatedAnswer/setIsLoading',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

export const setIsStreaming = createAction(
  'generatedAnswer/setIsStreaming',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

export const updateResponseFormat = createAction(
  'generatedAnswer/updateResponseFormat',
  (payload: GeneratedResponseFormat) =>
    validatePayload(payload, {
      answerStyle: new StringValue<GeneratedAnswerStyle>({
        required: true,
        constrainTo: generatedAnswerStyle,
      }),
    })
);

export const registerFieldsToIncludeInCitations = createAction(
  'generatedAnswer/registerFieldsToIncludeInCitations',
  (payload: string[]) => validatePayload<string[]>(payload, nonEmptyStringArray)
);

export const abortStream = createAsyncThunk<
  void,
  void,
  AsyncThunkGeneratedAnswerOptions<StateNeededByGeneratedAnswerStream>
>('generatedAnswer/abortStream', async (_, config) => {
  const {extra} = config;
  extra.streamingClient?.abortAnyOngoingStream();
});

export const streamAnswer = createAsyncThunk<
  void,
  {streamId: string},
  AsyncThunkGeneratedAnswerOptions<StateNeededByGeneratedAnswerStream>
>('generatedAnswer/streamAnswer', async (payload, config) => {
  validatePayload(payload, {streamId: nonEmptyString});
  const state = config.getState();
  const {dispatch, extra} = config;

  const request = await buildStreamingRequest(state, payload.streamId);

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

  const currentStreamRequestMatchesOriginalStreamRequest = (
    request: GeneratedAnswerStreamRequest
  ) => {
    return (
      request.streamId ===
      config.getState().search?.extendedResults.generativeQuestionAnsweringId
    );
  };
  extra.streamingClient?.streamGeneratedAnswer(request, {
    write: (data: GeneratedAnswerStreamEventData) => {
      if (
        currentStreamRequestMatchesOriginalStreamRequest(request) &&
        data.payload &&
        data.payloadType
      ) {
        handleStreamPayload(data.payloadType, data.payload);
      }
    },
    abort: (error: GeneratedAnswerErrorPayload) => {
      if (currentStreamRequestMatchesOriginalStreamRequest(request)) {
        dispatch(updateError(error));
      }
    },
    close: () => {
      if (currentStreamRequestMatchesOriginalStreamRequest(request)) {
        dispatch(setIsStreaming(false));
      }
    },
    resetAnswer: () => {
      if (currentStreamRequestMatchesOriginalStreamRequest(request)) {
        dispatch(resetAnswer());
      }
    },
  });
});
