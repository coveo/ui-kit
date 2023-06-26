import {
  AnalyticsClientSendEventHook,
  CoveoSearchPageClient,
  SearchPageClientProvider,
} from 'coveo.analytics';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';
import {Logger} from 'pino';
import {SectionNeededForFacetMetadata} from '../../features/facets/facet-set/facet-set-analytics-actions-utils';
import {
  ConfigurationSection,
  ProductListingSection,
  SearchHubSection,
} from '../../state/state-sections';
import {PreprocessRequest} from '../preprocess-request';
import {getProductListingInitialState} from './../../features/product-listing/product-listing-state';
import {BaseAnalyticsProvider} from './base-analytics';

export type StateNeededByProductListingAnalyticsProvider =
  ConfigurationSection &
    ProductListingSection &
    Partial<SearchHubSection & SectionNeededForFacetMetadata>;

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

interface ConfigureProductListingAnalyticsOptions {
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: SearchPageClientProvider;
  getState(): StateNeededByProductListingAnalyticsProvider;
}

export const configureProductListingAnalytics = ({
  logger,
  getState,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new ProductListingAnalyticsProvider(getState),
}: ConfigureProductListingAnalyticsOptions) => {
  const state = getState();
  const token = state.configuration.accessToken;
  const endpoint = state.configuration.analytics.apiBaseUrl;
  const runtimeEnvironment = state.configuration.analytics.runtimeEnvironment;
  const enabled = state.configuration.analytics.enabled;
  const client = new CoveoSearchPageClient(
    {
      token,
      endpoint,
      runtimeEnvironment,
      preprocessRequest,
      beforeSendHooks: [
        analyticsClientMiddleware,
        (type, payload) => {
          logger.info(
            {
              ...payload,
              type,
              endpoint,
              token,
            },
            'Analytics request'
          );
          return payload;
        },
      ],
    },
    provider
  );

  if (!enabled) {
    client.disable();
  }

  return client;
};
