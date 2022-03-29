import {Result} from '../../api/search/search/result';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {logOpenSmartSnippetSource} from '../../features/question-answering/question-answering-analytics-actions';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
} from '../core/interactive-result/headless-core-interactive-result';

export interface SmartSnippetSourceOptions {
  /**
   * The query result which is the source of the snippet.
   */
  result: Result;

  /**
   * The amount of time to wait before selecting the source after calling `beginDelayedSelect`.
   *
   * @defaultValue `1000`
   */
  selectionDelay?: number;
}

export interface SmartSnippetSourceProps {
  /**
   * The options for the `SmartSnippetSource` controller.
   * */
  options: SmartSnippetSourceOptions;
}

/**
 * The `SmartSnippetSource` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects the source of a result.
 */
export interface SmartSnippetSource extends InteractiveResultCore {}

/**
 * Creates an `SmartSnippetSource` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippetSource` properties.
 * @returns An `SmartSnippetSource` controller instance.
 */
export function buildSmartSnippetSource(
  engine: SearchEngine,
  props: SmartSnippetSourceProps
): SmartSnippetSource {
  let wasOpened = false;

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(logOpenSmartSnippetSource(props.options.result));
  };

  const action = () => {
    logAnalyticsIfNeverOpened();
    engine.dispatch(pushRecentResult(props.options.result));
  };

  return buildInteractiveResultCore(engine, props, action);
}
