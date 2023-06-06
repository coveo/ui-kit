import {EventSourcePolyfill} from 'event-source-polyfill';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  sseMessage,
  sseError,
  sseComplete,
  streamAnswer,
  resetAnswer,
} from '../../features/generated-answer/generated-answer-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {GeneratedAnswerSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController} from '../controller/headless-controller';

export type {GeneratedAnswerState};

export interface GeneratedAnswer {
  /**
   * The state of the GeneratedAnswer controller.
   */
  state: GeneratedAnswerState;
  /**
   * Re-executes the last query to generate an answer.
   */
  retry(): void;
}

/**
 * Creates a `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 * */
export function buildGeneratedAnswer(engine: SearchEngine): GeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  let timeout: ReturnType<typeof setTimeout>;
  let source: EventSourcePolyfill;
  let lastRequestId: string;

  const onMessage = (message: string) => {
    dispatch(sseMessage(message));
  };

  const onError = () => {
    source?.close();
    clearTimeout(timeout);
    dispatch(sseError());
  };

  const onCompleted = () => {
    source?.close();
    clearTimeout(timeout);
    dispatch(sseComplete());
  };

  const setEventSourceRef = (sourceRef: EventSourcePolyfill) => {
    source = sourceRef;
  };

  const subscribeToSearchRequests = () => {
    const strictListener = () => {
      const state = getState();
      const newRequestId = state.search.requestId;

      if (lastRequestId !== newRequestId) {
        lastRequestId = newRequestId;
        source?.close();
        dispatch(resetAnswer());
        if (state.search.extendedResults?.streamId) {
          dispatch(
            streamAnswer({
              onMessage,
              onError,
              onCompleted,
              setEventSourceRef,
            })
          );
        }
      }
    };
    return engine.subscribe(strictListener);
  };

  subscribeToSearchRequests();

  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },

    retry() {
      // TODO: Swap for real analytics event
      dispatch(executeSearch(logSearchboxSubmit()));
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: SearchEngine
): engine is SearchEngine<GeneratedAnswerSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
