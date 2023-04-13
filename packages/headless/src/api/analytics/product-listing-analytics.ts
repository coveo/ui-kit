import {SearchPageClientProvider} from 'coveo.analytics';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';
import {
  ConfigurationSection,
  ProductListingSection,
  SearchHubSection,
} from '../../state/state-sections';
import {getProductListingInitialState} from './../../features/product-listing/product-listing-state';
import {BaseAnalyticsProvider} from './base-analytics';

export type StateNeededByProductListingAnalyticsProvider =
  ConfigurationSection & ProductListingSection & Partial<SearchHubSection>;

export class ProductListingAnalyticsProvider
  extends BaseAnalyticsProvider<StateNeededByProductListingAnalyticsProvider>
  implements SearchPageClientProvider
{
  private initialState = getProductListingInitialState();

  public getPipeline(): string {
    return '';
  }

  public getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  > {
    return {
      queryText: '',
      responseTime: 0,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getSearchUID() {
    const newState = this.getState();
    return newState.productListing?.responseId || this.initialState.responseId;
  }

  private mapResultsToAnalyticsDocument() {
    return this.state.productListing?.products.map((p) => ({
      documentUri: p.documentUri,
      documentUriHash: p.documentUriHash,
      permanentid: p.permanentid,
    }));
  }

  private get numberOfResults() {
    return this.state.productListing.products.length;
  }
}
