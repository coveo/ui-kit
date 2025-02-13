import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkGeneratedAnswerOptions} from '../../api/generated-answer/generated-answer-client.js';
import {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerEndOfStreamPayload,
  GeneratedAnswerHeaderMessagePayload,
  GeneratedAnswerMessagePayload,
  GeneratedAnswerPayloadType,
  GeneratedAnswerStreamEventData,
} from '../../api/generated-answer/generated-answer-event-payload.js';
import {GeneratedAnswerStreamRequest} from '../../api/generated-answer/generated-answer-request.js';
import {
  ConfigurationSection,
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections.js';
import {
  nonEmptyStringArray,
  validatePayload,
} from '../../utils/validate-payload.js';
import {logGeneratedAnswerStreamEnd} from './generated-answer-analytics-actions.js';
import {buildStreamingRequest} from './generated-answer-request.js';
import {
  GeneratedContentFormat,
  GeneratedResponseFormat,
  generatedContentFormat,
} from './generated-response-format.js';

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

const answerContentFormatSchema = new StringValue<GeneratedContentFormat>({
  required: true,
  constrainTo: generatedContentFormat,
});

export interface GeneratedAnswerErrorPayload {
  message?: string;
  code?: number;
}

export const setIsVisible = createAction(
  'generatedAnswer/setIsVisible',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

export const setIsEnabled = createAction(
  'generatedAnswer/setIsEnabled',
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

export const expandGeneratedAnswer = createAction('generatedAnswer/expand');

export const collapseGeneratedAnswer = createAction('generatedAnswer/collapse');

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

export const setAnswerContentFormat = createAction(
  'generatedAnswer/setAnswerContentFormat',
  (payload: GeneratedContentFormat) =>
    validatePayload(payload, answerContentFormatSchema)
);

export const updateResponseFormat = createAction(
  'generatedAnswer/updateResponseFormat',
  (payload: GeneratedResponseFormat) =>
    validatePayload(payload, {
      contentFormat: new ArrayValue<GeneratedContentFormat>({
        each: answerContentFormatSchema,
        default: ['text/plain'],
      }),
    })
);

export const updateAnswerConfigurationId = createAction(
  'knowledge/updateAnswerConfigurationId',
  (payload: string) => validatePayload(payload, stringValue)
);

export const registerFieldsToIncludeInCitations = createAction(
  'generatedAnswer/registerFieldsToIncludeInCitations',
  (payload: string[]) => validatePayload<string[]>(payload, nonEmptyStringArray)
);

export const setIsAnswerGenerated = createAction(
  'generatedAnswer/setIsAnswerGenerated',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

export const setCannotAnswer = createAction(
  'generatedAnswer/setCannotAnswer',
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
  const {dispatch, extra, getState} = config;
  const {search} = getState();
  const {queryExecuted} = search;

  const {setAbortControllerRef} = params;

  const request = await buildStreamingRequest(state);

  const handleStreamPayload = (
    payloadType: GeneratedAnswerPayloadType,
    payload: string
  ) => {
    switch (payloadType) {
      case 'genqa.headerMessageType': {
        const header = JSON.parse(
          payload
        ) as GeneratedAnswerHeaderMessagePayload;
        dispatch(setAnswerContentFormat(header.contentFormat));
        break;
      }
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
      case 'genqa.endOfStreamType': {
        const isAnswerGenerated = (
          JSON.parse(payload) as GeneratedAnswerEndOfStreamPayload
        ).answerGenerated;
        const cannotAnswer = queryExecuted.length !== 0 && !isAnswerGenerated;

        dispatch(setCannotAnswer(cannotAnswer));
        dispatch(setIsStreaming(false));
        dispatch(setIsAnswerGenerated(isAnswerGenerated));
        dispatch(logGeneratedAnswerStreamEnd(isAnswerGenerated));
        break;
      }
      default:
        if (state.debug) {
          extra.logger.warn(`Unknown payloadType: "${payloadType}"`);
        }
    }
  };

  dispatch(setIsLoading(true));

  const currentStreamRequestMatchesOriginalStreamRequest = (
    request: GeneratedAnswerStreamRequest
  ) => {
    return (
      request.streamId ===
      config.getState().search.extendedResults.generativeQuestionAnsweringId
    );
  };
  const abortController = extra.streamingClient?.streamGeneratedAnswer(
    request,
    {
      write: (data: GeneratedAnswerStreamEventData) => {
        if (currentStreamRequestMatchesOriginalStreamRequest(request)) {
          dispatch(setIsLoading(false));
          if (data.payload && data.payloadType) {
            handleStreamPayload(data.payloadType, data.payload);
          }
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
    }
  );
  if (abortController) {
    setAbortControllerRef(abortController);
  } else {
    dispatch(setIsLoading(false));
  }
});
