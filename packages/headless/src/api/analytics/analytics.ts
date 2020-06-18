import {CoveoSearchPageClient, SearchPageClientProvider} from 'coveo.analytics';
import {SearchPageState} from '../../state';

export class AnalyticsProvider implements SearchPageClientProvider {
  constructor(private state: SearchPageState) {}

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

export const configureAnalytics = (state: SearchPageState) => {
  const provider = new AnalyticsProvider(state);
  return new CoveoSearchPageClient(
    {token: state.configuration.accessToken},
    provider
  );
};
