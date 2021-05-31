import {SearchSection} from '../../state/state-sections';

export function firstSearchExecutedSelector(state: SearchSection) {
  return state.search.response.searchUid !== '';
}
