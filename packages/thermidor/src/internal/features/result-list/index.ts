export {getOrCreateResultsSlice} from './result-list-slice.js';
export {getOrCreateResultsActions} from './result-list-actions.js';
export {getOrCreateResultsSelectors} from './result-list-selectors.js';
export type {ResultListState, SearchResult} from './result-list-types.js';

import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {SearchResult} from './result-list-types.js';
import {getOrCreateResultsActions} from './result-list-actions.js';

export function setResultsFromResponse(results: SearchResult[], iface: InterfaceHandle) {
  return getOrCreateResultsActions(iface).setResultsFromResponse(results);
}
