import type {Unsubscribe} from '@reduxjs/toolkit';
import type {GeneratedAnswerAPIClient} from '../../../api/generated-answer/generated-answer-client.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import type {ConfigurationState} from '../../../features/configuration/configuration-state.js';
import {
  resetAnswer,
  setId,
  streamAnswer,
} from '../../../features/generated-answer/generated-answer-actions.js';
import {generatedAnswerReducer as generatedAnswer} from '../../../features/generated-answer/generated-answer-slice.js';
import {executeSearch} from '../../../features/search/search-actions.js';
import type {
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {randomID} from '../../../utils/utils.js';
import {
  buildCoreGeneratedAnswer,
  type GeneratedAnswer,
  type GeneratedAnswerAnalyticsClient,
  type GeneratedAnswerProps,
} from './headless-core-generated-answer.js';

interface SearchAPIGeneratedAnswer extends GeneratedAnswer {}

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
      ClientThunkExtraArguments<GeneratedAnswerAPIClient>,
      ConfigurationState
    >
  ) => Unsubscribe;
}

export const subscribeStateManager: SubscribeStateManager = {
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
        if (state.generatedAnswer.isEnabled === false) {
          return;
        }

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
        if (state.generatedAnswer.isEnabled === false) {
          return;
        }
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

interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

/**
 * Creates a `GeneratedAnswer` controller instance using the search API stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildSearchAPIGeneratedAnswer(
  engine: SearchEngine | InsightEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: GeneratedAnswerProps = {}
): SearchAPIGeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildCoreGeneratedAnswer(engine, analyticsClient, props);
  const getState = () => engine.state;

  if (
    engine.state.generatedAnswer.id &&
    !subscribeStateManager.engines[engine.state.generatedAnswer.id]
  ) {
    subscribeStateManager.engines[engine.state.generatedAnswer.id] = {
      abortController: undefined,
      lastRequestId: engine.state.search.requestId,
      lastStreamId:
        engine.state.search.extendedResults.generativeQuestionAnsweringId ?? '',
    };
  }

  if (!engine.state.generatedAnswer.id) {
    const genQaEngineId = randomID('genQA-', 12);
    engine.dispatch(setId({id: genQaEngineId}));
  }

  if (!subscribeStateManager.engines[engine.state.generatedAnswer.id]) {
    subscribeStateManager.engines[engine.state.generatedAnswer.id] = {
      abortController: undefined,
      lastRequestId: '',
      lastStreamId: '',
    };
  }

  subscribeStateManager.subscribeToSearchRequests(engine);

  const isSearchEngine = (
    engine: SearchEngine | InsightEngine
  ): engine is SearchEngine =>
    'executeFirstSearchAfterStandaloneSearchBoxRedirect' in engine;
  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },
    retry() {
      if (!isSearchEngine(engine)) {
        return;
      }
      engine.dispatch(
        executeSearch({
          legacy: analyticsClient.logRetryGeneratedAnswer(),
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
