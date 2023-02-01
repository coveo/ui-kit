import {SearchAnalyticsProvider} from './search-analytics';

export class InstantResultsAnalyticsProvider extends SearchAnalyticsProvider {
  private get instantResultsSearchUid() {
    const state = this.getState().instantResults;
    if (!state) {
      return null;
    }

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
