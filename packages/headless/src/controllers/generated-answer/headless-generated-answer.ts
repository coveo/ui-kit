import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {updateResponseFormat} from '../../features/generated-answer/generated-answer-actions';
import {generatedAnswerAnalyticsClient} from '../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../features/search/search-actions';
import {GeneratedAnswerSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {
  GeneratedAnswer,
  GeneratedAnswerProps,
  buildCoreGeneratedAnswer,
} from '../core/generated-answer/headless-core-generated-answer';

export type {
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerState,
  GeneratedAnswer,
  GeneratedAnswerProps,
};

/**
 * Creates a `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildGeneratedAnswer(
  engine: SearchEngine,
  props: GeneratedAnswerProps = {}
): GeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildCoreGeneratedAnswer(
    engine,
    generatedAnswerAnalyticsClient,
    props
  );
  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },

    retry() {
      dispatch(
        executeSearch({
          legacy: generatedAnswerAnalyticsClient.logRetryGeneratedAnswer(),
        })
      );
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      dispatch(updateResponseFormat(responseFormat));
      dispatch(
        executeSearch({
          legacy:
            generatedAnswerAnalyticsClient.logRephraseGeneratedAnswer(
              responseFormat
            ),
        })
      );
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: SearchEngine
): engine is SearchEngine<GeneratedAnswerSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
