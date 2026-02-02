import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerMessagePayload,
} from '../../api/generated-answer/generated-answer-event-payload.js';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {initiateFollowUpAnswerGeneration} from '../../api/knowledge/answer-generation/endpoints/follow-up-answer-endpoint.js';
import type {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import type {SearchThunkExtraArguments} from '../../app/search-thunk-extra-arguments.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  answerContentFormatSchema,
  citationSchema,
  type GeneratedAnswerErrorPayload,
} from '../generated-answer/generated-answer-actions.js';
import type {GeneratedContentFormat} from '../generated-answer/generated-response-format.js';
import {constructGenerateFollowUpAnswerParams} from './follow-up-answer-request.js';

const stringValue = new StringValue({required: true});

export const setIsEnabled = createAction(
  'generatedAnswer/setIsEnabled',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const addFollowUpAnswer = createAction<string>(
  'generatedAnswer/addFollowUpAnswer'
);

export const updateActiveFollowUpAnswerMessage = createAction(
  'generatedAnswer/updateActiveFollowUpMessage',
  (payload: GeneratedAnswerMessagePayload) =>
    validatePayload(payload, {
      textDelta: stringValue,
    })
);

export const updateActiveFollowUpAnswerCitations = createAction(
  'generatedAnswer/updateActiveFollowUpCitations',
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

export const updateActiveFollowUpError = createAction(
  'generatedAnswer/updateActiveFollowUpError',
  (payload: GeneratedAnswerErrorPayload) =>
    validatePayload(payload, {
      message: new StringValue(),
      code: new NumberValue({min: 0}),
    })
);

export const setActiveFollowUpIsLoading = createAction(
  'generatedAnswer/setActiveFollowUpIsLoading',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const setActiveFollowUpIsStreaming = createAction(
  'generatedAnswer/setActiveFollowUpIsStreaming',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const setActiveFollowUpAnswerContentFormat = createAction(
  'generatedAnswer/setActiveFollowUpAnswerContentFormat',
  (payload: GeneratedContentFormat) =>
    validatePayload(payload, answerContentFormatSchema)
);

export const setActiveFollowUpAnswerId = createAction(
  'generatedAnswer/setActiveFollowUpAnswerId',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export const setActiveFollowUpIsAnswerGenerated = createAction(
  'generatedAnswer/setActiveFollowUpIsAnswerGenerated',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const setActiveFollowUpCannotAnswer = createAction(
  'generatedAnswer/setActiveFollowUpCannotAnswer',
  (payload: boolean) =>
    validatePayload(payload, new BooleanValue({required: true}))
);

export const resetFollowUpAnswers = createAction(
  'followUpAnswers/resetFollowUpAnswers'
);

export const generateFollowUpAnswer = createAsyncThunk<
  void,
  string,
  AsyncThunkOptions<AnswerGenerationApiState, SearchThunkExtraArguments>
>(
  'generatedAnswerConversation/generateFollowUpAnswer',
  async (question, {getState, dispatch, extra: {logger}}) => {
    const state = getState() as AnswerGenerationApiState;
    if (!state.generatedAnswer.answerConfigurationId) {
      logger.warn(
        'Missing answerConfigurationId in engine configuration. ' +
          'The generateAnswer action requires an answer configuration ID.'
      );
      return;
    }

    dispatch(addFollowUpAnswer(question));
    const generateFollowUpAnswerParams = constructGenerateFollowUpAnswerParams(
      question,
      state
    );
    await dispatch(
      initiateFollowUpAnswerGeneration({
        ...generateFollowUpAnswerParams,
        q: question,
      })
    );
  }
);
