import {SearchPageClientProvider} from 'coveo.analytics';
import {getProductRecommendationsInitialState} from '../../features/product-recommendations/product-recommendations-state';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';
import {
  ConfigurationSection,
  ProductRecommendationsSection,
  SearchHubSection,
} from '../../state/state-sections';
import {getLanguage} from './shared-analytics';

export type StateNeededByProductRecommendationsAnalyticsProvider = ConfigurationSection &
  Partial<SearchHubSection & ProductRecommendationsSection>;

export class ProductRecommendationAnalyticsProvider
  implements SearchPageClientProvider {
  private initialState = getProductRecommendationsInitialState();
  constructor(
    private state: StateNeededByProductRecommendationsAnalyticsProvider
  ) {}

  public getLanguage() {
    return getLanguage(this.state);
  }

  public getSearchEventRequestPayload() {
    return {
      queryText: '',
      responseTime: this.responseTime,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getBaseMetadata() {
    return {
      recommendation:
        this.state.productRecommendations?.id || this.initialState.id,
    };
  }

  public getSearchUID() {
    return (
      this.state.productRecommendations?.searchUid ||
      this.initialState.searchUid
    );
  }

  public getPipeline() {
    return '';
  }

  public getOriginLevel1() {
    return this.state.searchHub || getSearchHubInitialState();
  }

  public getOriginLevel2() {
    return this.state.configuration.analytics.originLevel2 || 'default';
  }

  public getOriginLevel3() {
    return this.state.configuration.analytics.originLevel3 || 'default';
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
