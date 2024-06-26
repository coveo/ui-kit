import {Unsubscribe} from '@reduxjs/toolkit';
import {LegacyGeneratedAnswerAPIClient} from '../../../api/generated-answer/generated-answer-client';
import {CoreEngine} from '../../../app/engine';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {
  resetAnswer,
  setId,
  streamAnswer,
} from '../../../features/generated-answer/generated-answer-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../../features/generated-answer/generated-answer-slice';
import {executeSearch} from '../../../features/search/search-actions';
import {
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {randomID} from '../../../utils/utils';
import {
  buildCoreGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerAnalyticsClient,
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from './headless-core-generated-answer';

export interface SearchAPIGeneratedAnswer extends GeneratedAnswer {}
export interface SearchAPIGeneratedAnswerProps extends GeneratedAnswerProps {}

interface SubscribeStateManager {
  engines: Record<
    string,
    {
      abortController: AbortController | undefined;
      lastRequestId: string;
      lastStreamId: string;
    }
  >;
  getIsStreamInProgress: (genQaEngineId: string) => boolean;
  setAbortControllerRef: (ref: AbortController, genQaEngineId: string) => void;
  subscribeToSearchRequests: (
    engine: CoreEngine<
      GeneratedAnswerSection & SearchSection & DebugSection,
      ClientThunkExtraArguments<LegacyGeneratedAnswerAPIClient>
    >
  ) => Unsubscribe;
}

const subscribeStateManager: SubscribeStateManager = {
  engines: {},

  setAbortControllerRef: (ref: AbortController, genQaEngineId: string) => {
    subscribeStateManager.engines[genQaEngineId].abortController = ref;
  },

  getIsStreamInProgress: (genQaEngineId: string) => {
    if (
      !subscribeStateManager.engines[genQaEngineId].abortController ||
      subscribeStateManager.engines[genQaEngineId].abortController?.signal
        .aborted
    ) {
      subscribeStateManager.engines[genQaEngineId].abortController = undefined;
      return false;
    }
    return true;
  },

  subscribeToSearchRequests: (engine) => {
    const strictListener = () => {
      const state = engine.state;
      const requestId = state.search.requestId;
      const streamId =
        state.search.extendedResults.generativeQuestionAnsweringId;

      const genQaEngineId = state.generatedAnswer.id;

      if (
        subscribeStateManager.engines[genQaEngineId].lastRequestId !== requestId
      ) {
        subscribeStateManager.engines[genQaEngineId].lastRequestId = requestId;
        subscribeStateManager.engines[genQaEngineId].abortController?.abort();
        engine.dispatch(resetAnswer());
      }

      const isStreamInProgress =
        subscribeStateManager.getIsStreamInProgress(genQaEngineId);
      if (
        !isStreamInProgress &&
        streamId &&
        streamId !== subscribeStateManager.engines[genQaEngineId].lastStreamId
      ) {
        subscribeStateManager.engines[genQaEngineId].lastStreamId = streamId;
        engine.dispatch(
          streamAnswer({
            setAbortControllerRef: (ref: AbortController) =>
              subscribeStateManager.setAbortControllerRef(ref, genQaEngineId),
          })
        );
      }
    };
    return engine.subscribe(strictListener);
  },
};

export interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

/**
 * Creates a `GeneratedAnswer` controller instance using the search api stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildSearchAPIGeneratedAnswer(
  engine: SearchEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: GeneratedAnswerProps = {}
): SearchAPIGeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildCoreGeneratedAnswer(engine, analyticsClient, props);
  const getState = () => engine.state;

  if (!engine.state.generatedAnswer.id) {
    const genQaEngineId = randomID('genQA-', 12);
    dispatch(setId({id: genQaEngineId}));
    subscribeStateManager.engines[genQaEngineId] = {
      abortController: undefined,
      lastRequestId: '',
      lastStreamId: '',
    };
  }

  subscribeStateManager.subscribeToSearchRequests(engine);

  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },
    retry() {
      dispatch(
        executeSearch({
          legacy: analyticsClient.logRetryGeneratedAnswer(),
        })
      );
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      controller.rephrase(responseFormat);
      dispatch(
        executeSearch({
          legacy: analyticsClient.logRephraseGeneratedAnswer(responseFormat),
        })
      );
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: CoreEngine
): engine is CoreEngine<GeneratedAnswerSection & SearchSection & DebugSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
