import {z} from '@coveo/bueno/zod';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkGeneratedAnswerOptions} from '../../api/generated-answer/generated-answer-client.js';
import type {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerEndOfStreamPayload,
  GeneratedAnswerHeaderMessagePayload,
  GeneratedAnswerMessagePayload,
  GeneratedAnswerPayloadType,
  GeneratedAnswerStreamEventData,
} from '../../api/generated-answer/generated-answer-event-payload.js';
import type {GeneratedAnswerStreamRequest} from '../../api/generated-answer/generated-answer-request.js';
import {fetchAnswer} from '../../api/knowledge/stream-answer-api.js';
import type {StreamAnswerAPIState} from '../../api/knowledge/stream-answer-api-state.js';
import type {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import type {SearchThunkExtraArguments} from '../../app/search-thunk-extra-arguments.js';
import type {AnswerApiQueryParams} from '../../features/generated-answer/generated-answer-request.js';
import type {
  ConfigurationSection,
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections.js';
import {
  nonEmptyStringArray,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from './generated-answer-analytics-actions.js';
import {
  buildStreamingRequest,
  constructAnswerAPIQueryParams,
} from './generated-answer-request.js';
import {
  GENERATION_STEP_NAMES,
  type GenerationStepName,
  normalizeGenerationStepName,
} from './generated-answer-state.js';
import {
  type GeneratedContentFormat,
  type GeneratedResponseFormat,
  generatedContentFormat,
} from './generated-response-format.js';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  SearchSection &
  GeneratedAnswerSection &
  DebugSection;

const stringValue = z.string();
const optionalStringValue = z.optional(z.string());
const booleanValue = z.boolean();
export const citationSchema = z.object({
  id: stringValue,
  title: stringValue,
  uri: stringValue,
  permanentid: stringValue,
  clickUri: optionalStringValue,
});

export const answerContentFormatSchema = z.enum(generatedContentFormat);

const generationStepNameValue = z.enum(GENERATION_STEP_NAMES);

const normalizeGenerationStepPayload = <T extends {name: string}>(
  payload: T
): Omit<T, 'name'> & {name: GenerationStepName} => ({
  ...payload,
  name: normalizeGenerationStepName(payload.name),
});

export interface GeneratedAnswerErrorPayload {
  message?: string;
  code?: number;
}

export const setIsVisible = createAction(
  'generatedAnswer/setIsVisible',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

export const setAnswerId = createAction(
  'generatedAnswer/setAnswerId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setAnswerGenerationMode = createAction(
  'generatedAnswer/setAnswerGenerationMode',
  (payload: 'automatic' | 'manual') =>
    validatePayload(payload, z.enum(['automatic', 'manual']))
);

export const setIsEnabled = createAction(
  'generatedAnswer/setIsEnabled',
  (payload: boolean) => validatePayload(payload, booleanValue)
);

export const updateMessage = createAction(
  'generatedAnswer/updateMessage',
  (payload: GeneratedAnswerMessagePayload) =>
    validatePayload(
      payload,
      z.object({
        textDelta: stringValue,
      })
    )
);

export const updateCitations = createAction(
  'generatedAnswer/updateCitations',
  (payload: GeneratedAnswerCitationsPayload) =>
    validatePayload(
      payload,
      z.object({
        citations: z.array(citationSchema),
      })
    )
);

export const updateError = createAction(
  'generatedAnswer/updateError',
  (payload: GeneratedAnswerErrorPayload) =>
    validatePayload(
      payload,
      z.object({
        message: optionalStringValue,
        code: z.optional(z.number().check(z.minimum(0))),
      })
    )
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
    validatePayload(
      payload,
      z.object({
        id: z.string(),
      })
    )
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
    validatePayload(
      payload,
      z.object({
        contentFormat: z.optional(z.array(answerContentFormatSchema)),
      })
    )
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

export const setAnswerApiQueryParams = createAction(
  'generatedAnswer/setAnswerApiQueryParams',
  (payload: Partial<AnswerApiQueryParams>) =>
    validatePayload(payload, z.object({}))
);

export const startStep = createAction(
  'generatedAnswer/startStep',
  (payload: {name: string; startedAt: number}) =>
    validatePayload(
      normalizeGenerationStepPayload(payload),
      z.object({
        name: generationStepNameValue,
        startedAt: z.number().check(z.minimum(0)),
      })
    )
);

export const finishStep = createAction(
  'generatedAnswer/finishStep',
  (payload: {name: string; finishedAt: number}) =>
    validatePayload(
      normalizeGenerationStepPayload(payload),
      z.object({
        name: generationStepNameValue,
        finishedAt: z.number().check(z.minimum(0)),
      })
    )
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
        const {answerId, answer} = getState().generatedAnswer;
        const hasExecutedQuery = queryExecuted.length !== 0;
        const cannotAnswer = hasExecutedQuery && !isAnswerGenerated;
        const isAnswerTextEmpty = !answer?.trim();
        dispatch(setCannotAnswer(cannotAnswer));
        dispatch(setIsStreaming(false));
        dispatch(setIsAnswerGenerated(isAnswerGenerated));
        dispatch(
          logGeneratedAnswerStreamEnd(
            isAnswerGenerated,
            answerId,
            isAnswerGenerated ? isAnswerTextEmpty : undefined
          )
        );
        dispatch(logGeneratedAnswerResponseLinked());
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

/**
 * Thunk to handle the sequence of actions required to generate a new answer
 * after a search request.
 *
 * ⚠️ This action only works when an **answer configuration ID** is present
 * in the engine configuration. In that case, the **Answer API** will be used
 * instead of the regular search pipeline.
 *
 * Flow:
 * 1. Reset the current generated answer state.
 * 2. Construct the Answer API query parameters based on the current state.
 * 3. Fetch a new answer from the Answer API using the provided configuration.
 */
export const generateAnswer = createAsyncThunk<
  void,
  void,
  AsyncThunkOptions<StreamAnswerAPIState, SearchThunkExtraArguments>
>(
  'generatedAnswer/generateAnswer',
  async (_, {getState, dispatch, extra: {navigatorContext, logger}}) => {
    dispatch(resetAnswer());

    const state = getState() as StreamAnswerAPIState;
    if (state.generatedAnswer.answerConfigurationId) {
      const answerApiQueryParams = constructAnswerAPIQueryParams(
        state,
        navigatorContext
      );
      // TODO: SVCC-5178 Refactor multiple sequential dispatches into single action
      dispatch(setAnswerApiQueryParams(answerApiQueryParams));
      await dispatch(fetchAnswer(answerApiQueryParams));
    } else {
      logger.warn(
        '[WARNING] Missing answerConfigurationId in engine configuration. ' +
          'The generateAnswer action requires an answer configuration ID to use CRGA with the Answer API.'
      );
    }
  }
);
