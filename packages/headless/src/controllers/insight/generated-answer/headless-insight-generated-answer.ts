import {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload';
import {updateResponseFormat} from '../../../features/generated-answer/generated-answer-actions';
import {generatedAnswerInsightAnalyticsClient} from '../../../features/generated-answer/generated-answer-insight-analytics-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {InsightEngine} from '../../../insight.index';
import {
  ConfigurationSection,
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  GeneratedAnswer,
  GeneratedAnswerProps,
  buildCoreGeneratedAnswer,
} from '../../core/generated-answer/headless-core-generated-answer';

export type {
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerState,
  GeneratedAnswer,
  GeneratedAnswerProps,
};

/**
 * Creates an insight `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildGeneratedAnswer(
  engine: InsightEngine,
  props: GeneratedAnswerProps = {}
): GeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildCoreGeneratedAnswer(
    engine,
    generatedAnswerInsightAnalyticsClient,
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
        executeSearch(
          generatedAnswerInsightAnalyticsClient.logRetryGeneratedAnswer()
        )
      );
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      dispatch(updateResponseFormat(responseFormat));
      dispatch(
        executeSearch(
          generatedAnswerInsightAnalyticsClient.logRephraseGeneratedAnswer(
            responseFormat
          )
        )
      );
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: InsightEngine
): engine is InsightEngine<
  GeneratedAnswerSection & SearchSection & ConfigurationSection & DebugSection
> {
  engine.addReducers({generatedAnswer});
  return true;
}
