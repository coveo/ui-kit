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
  extends BaseAnalyticsProvider<StateNeededByProductRecommendationsAnalyticsProvider>
  implements SearchPageClientProvider
{
  private initialState = getProductRecommendationsInitialState();

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
    const newState = this.getState();
    return (
      newState.productRecommendations?.searchUid || this.initialState.searchUid
    );
  }

  private mapResultsToAnalyticsDocument() {
    return this.state.productRecommendations?.recommendations.map((r) => ({
      documentUri: r.documentUri,
      documentUriHash: r.documentUriHash,
      permanentid: r.permanentid,
    }));
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
