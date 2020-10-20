import {CoveoSearchPageClient, SearchPageClientProvider} from 'coveo.analytics';
import {SearchAppState} from '../../state/search-app-state';

export class AnalyticsProvider implements SearchPageClientProvider {
  constructor(private state: SearchAppState) {}

  public getSearchEventRequestPayload() {
    return {
      queryText: this.queryText,
      responseTime: this.responseTime,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getBaseMetadata() {
    return {};
  }

  public getSearchUID() {
    return this.state.search.response.searchUid;
  }

  public getPipeline() {
    return this.state.pipeline;
  }

  public getOriginLevel1() {
    return this.state.searchHub;
  }

  public getOriginLevel2() {
    // TODO: When tab implemented;
    // Configurable on headless engine, optionally
    // Need to use tabs as originLevel2, in priority if they exists/available.
    // Otherwise, use configured originLevel2 on the engine.
    // Ultimate fallback should be `default`;
    return this.state.configuration.analytics.originLevel2 || 'default';
  }

  public getOriginLevel3() {
    // TODO: When referrer implemented;
    // Configurable on headless engine, optionally
    // If not specified at config time, need to fallback to use current referrer parameter for search API, if any
    // Otherwise: fallback to `default`;
    return this.state.configuration.analytics.originLevel3 || 'default';
  }

  private mapResultsToAnalyticsDocument() {
    return this.state.search.response.results.map((r) => ({
      documentUri: r.uri,
      documentUriHash: r.raw.urihash,
    }));
  }

  private get queryText() {
    return this.state.query.q;
  }

  private get responseTime() {
    return this.state.search.duration;
  }

  private get numberOfResults() {
    return this.state.search.response.results.length;
  }
}

export const configureAnalytics = (state: SearchAppState) => {
  const provider = new AnalyticsProvider(state);
  const client = new CoveoSearchPageClient(
    {
      token: state.configuration.accessToken,
      endpoint: state.configuration.analytics.apiBaseUrl,
    },
    provider
  );

  if (state.configuration.analytics.enabled === false) {
    client.disable();
  }
  return client;
};
