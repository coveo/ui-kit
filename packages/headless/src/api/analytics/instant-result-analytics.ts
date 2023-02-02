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

  private get instantResultsSearchUid() {
    const state = this.getState().instantResults;
    for (const id in state) {
      for (const query in state[id].cache) {
        if (state[id].cache[query].isActive) {
          return state[id].cache[query].searchUid;
        }
      }
    }

    return null;
  }
  public getSearchUID(): string {
    return this.instantResultsSearchUid || super.getSearchUID();
  }
}
