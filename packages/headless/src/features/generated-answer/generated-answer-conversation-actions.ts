import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {
  initiateHeadAnswerGeneration,
  selectHeadAnswer,
} from '../../api/knowledge/answer-generation/endpoints/head-answer.js';
import type {GeneratedAnswerStream} from '../../api/knowledge/generated-answer-stream.js';
import type {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import type {SearchThunkExtraArguments} from '../../app/search-thunk-extra-arguments.js';
import {resetAnswer} from './generated-answer-actions.js';
import {constructGenerateHeadAnswerParams} from './generated-answer-request.js';

export const hydrateAnswerFromCache = createAction<GeneratedAnswerStream>(
  'generatedAnswer/hydrateFromCache'
);

export const generateHeadAnswer = createAsyncThunk<
  void,
  void,
  AsyncThunkOptions<AnswerGenerationApiState, SearchThunkExtraArguments>
>(
  'generatedAnswerConversation/generateHeadAnswer',
  async (_, {getState, dispatch, extra: {navigatorContext, logger}}) => {
    const state = getState() as AnswerGenerationApiState;
    if (!state.generatedAnswer.answerConfigurationId) {
      logger.warn(
        'Missing answerConfigurationId in engine configuration. ' +
          'The generateAnswer action requires an answer configuration ID.'
      );
      return;
    }

    dispatch(resetAnswer());
    const generateHeadAnswerParams = constructGenerateHeadAnswerParams(
      state,
      navigatorContext
    );
    const cachedResponse = selectHeadAnswer(generateHeadAnswerParams, state);
    if (cachedResponse.status === 'fulfilled') {
      dispatch(hydrateAnswerFromCache(cachedResponse.data));
      return;
    }
    await dispatch(initiateHeadAnswerGeneration(generateHeadAnswerParams));
  }
);
