import {QuerySection} from '../../state/state-sections';

export function currentQuerySelector(state: QuerySection) {
  return state.query;
}
