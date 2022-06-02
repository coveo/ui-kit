import {InsightSearchSection} from '../../state/state-sections';

export function firstSearchExecutedSelector(state: InsightSearchSection) {
  return state.insightSearch.response.searchUid !== '';
}
