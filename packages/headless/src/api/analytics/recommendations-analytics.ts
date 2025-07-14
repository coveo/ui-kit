import type {SearchPageClientProvider} from 'coveo.analytics';
import type {SearchEventRequest} from 'coveo.analytics/dist/definitions/events.js';
import {getQueryInitialState} from '../../features/query/query-state.js';
import {getRecommendationInitialState} from '../../features/recommendation/recommendation-state.js';
import type {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  RecommendationSection,
  SearchHubSection,
} from '../../state/state-sections.js';
import {BaseAnalyticsProvider} from './base-analytics.js';

export type StateNeededByRecommendationAnalyticsProvider =
  ConfigurationSection &
    Partial<
      SearchHubSection &
        PipelineSection &
        ContextSection &
        RecommendationSection
    >;

export class RecommendationAnalyticsProvider
  extends BaseAnalyticsProvider<StateNeededByRecommendationAnalyticsProvider>
  implements SearchPageClientProvider
{
  public getPipeline(): string {
    return (
      this.state.pipeline || this.state.recommendation?.pipeline || 'default'
    );
  }

  public getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  > {
    return {
      queryText: getQueryInitialState().q,
      responseTime: this.responseTime,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getSearchUID(): string {
    const newState = this.getState();
    return (
      newState.recommendation?.searchUid ||
      getRecommendationInitialState().searchUid
    );
  }

  public getSplitTestRunName(): string | undefined {
    return this.state.recommendation?.splitTestRun;
  }

  public getSplitTestRunVersion(): string | undefined {
    const hasSplitTestRun = !!this.getSplitTestRunName();
    const effectivePipelineWithSplitTestRun =
      this.state.recommendation?.pipeline || this.state.pipeline || 'default';

    return hasSplitTestRun ? effectivePipelineWithSplitTestRun : undefined;
  }

  private get responseTime() {
    return (
      this.state.recommendation?.duration ||
      getRecommendationInitialState().duration
    );
  }

  private mapResultsToAnalyticsDocument() {
    return this.state.recommendation?.recommendations.map((r) => ({
      documentUri: r.uri,
      documentUriHash: r.raw.urihash,
    }));
  }

  private get numberOfResults() {
    return (
      this.state.recommendation?.recommendations.length ||
      getRecommendationInitialState().recommendations.length
    );
  }
}
