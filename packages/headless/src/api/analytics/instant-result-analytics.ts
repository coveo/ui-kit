import {InstantResultSection} from '../../state/state-sections';
import {
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
} from './search-analytics';

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

  public getSearchUID(): string {
    const searchUid = this.activeInstantResultCache?.searchUid;
    return searchUid || super.getSearchUID();
  }

  public getSearchEventRequestPayload() {
    const payload = super.getSearchEventRequestPayload();
    const queryText = this.activeInstantResultQuery || payload.queryText;
    return {...payload, queryText};
  }
}
