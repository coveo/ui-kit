import {SearchPageClientProvider} from 'coveo.analytics';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';
import {getProductRecommendationsInitialState} from '../../features/product-recommendations/product-recommendations-state';
import {
  ConfigurationSection,
  ProductRecommendationsSection,
  SearchHubSection,
} from '../../state/state-sections';
import {BaseAnalyticsProvider} from './base-analytics';

export type StateNeededByProductRecommendationsAnalyticsProvider =
  ConfigurationSection &
    Partial<SearchHubSection & ProductRecommendationsSection>;

export class ProductRecommendationAnalyticsProvider
  extends BaseAnalyticsProvider
  implements SearchPageClientProvider
{
  private initialState = getProductRecommendationsInitialState();
  constructor(
    private state: StateNeededByProductRecommendationsAnalyticsProvider
  ) {
    super(state);
  }

  public getPipeline(): string {
    return '';
  }

  public getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  > {
    return {
      queryText: '',
      responseTime: this.responseTime,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getSearchUID() {
    return (
      this.state.productRecommendations?.searchUid ||
      this.initialState.searchUid
    );
  }

  private mapResultsToAnalyticsDocument() {
    return [];
  }

  private get responseTime() {
    return (
      this.state.productRecommendations?.duration || this.initialState.duration
    );
  }

  private get numberOfResults() {
    return (
      this.state.productRecommendations?.recommendations.length ||
      this.initialState.recommendations.length
    );
  }
}
