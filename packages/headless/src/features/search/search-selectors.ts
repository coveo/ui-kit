import {SearchSection} from '../../state/state-sections';
import {getResultProperty} from '../result-templates/result-templates-helpers';

export function firstSearchExecutedSelector(state: SearchSection) {
  return state.search.response.searchUid !== '';
}

export function resultFromFieldSelector(
  state: SearchSection,
  contentIdKey: string,
  contentIdValue: string
) {
  return (
    state.search.results.find(
      (result) => getResultProperty(result, contentIdKey) === contentIdValue
    ) ?? undefined
  );
}
