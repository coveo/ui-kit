export {getOrCreateSearchBoxSlice} from './search-box-slice.js';
export type {SearchBoxState} from './search-box-slice.js';
export {getOrCreateSearchBoxActions} from './search-box-actions.js';
export {getOrCreateSearchBoxSelectors} from './search-box-selectors.js';

import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxSelectors} from './search-box-selectors.js';
import {getOrCreateSearchBoxActions} from './search-box-actions.js';

export function getQuery(iface: InterfaceHandle) {
  return getOrCreateSearchBoxSelectors(iface).getQuery;
}

export function setQuery(query: string, iface: InterfaceHandle) {
  return getOrCreateSearchBoxActions(iface).setQuery(query);
}
