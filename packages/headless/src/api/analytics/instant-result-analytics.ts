import {getQueryInitialState} from '../../features/query/query-state.js';
import {getSearchInitialState} from '../../features/search/search-state.js';
import type {InstantResultSection} from '../../state/state-sections.js';
import {
  SearchAnalyticsProvider,
  type StateNeededBySearchAnalyticsProvider,
} from './search-analytics.js';

export type StateNeededByInstantResultsAnalyticsProvider =
  StateNeededBySearchAnalyticsProvider & InstantResultSection;

export class InstantResultsAnalyticsProvider extends SearchAnalyticsProvider {
  constructor(
    protected getState: () => StateNeededByInstantResultsAnalyticsProvider
  ) {
    super(getState);
  }

  private get activeInstantResultQuery() {
    const state = this.getState().instantResults;
    for (const id in state) {
      for (const query in state[id].cache) {
        if (state[id].cache[query].isActive) {
          return state[id].q;
        }
      }
    }

    return null;
  }

  private get activeInstantResultCache() {
    const state = this.getState().instantResults;
    for (const id in state) {
      for (const query in state[id].cache) {
        if (state[id].cache[query].isActive) {
          return state[id].cache[query];
        }
      }
    }

    return null;
  }

  protected get results() {
    return this.activeInstantResultCache?.results;
  }

  protected get queryText() {
    return this.activeInstantResultQuery ?? getQueryInitialState().q;
  }

  protected get responseTime() {
    return (
      this.activeInstantResultCache?.duration ??
      getSearchInitialState().duration
    );
  }

  protected get numberOfResults() {
    return (
      this.activeInstantResultCache?.totalCountFiltered ??
      getSearchInitialState().response.totalCountFiltered
    );
  }

  public getSearchUID(): string {
    const searchUid = this.activeInstantResultCache?.searchUid;
    return searchUid || super.getSearchUID();
  }
}
