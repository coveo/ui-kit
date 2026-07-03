import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

export const getQuery = (iface: InterfaceHandle) => {
  return getOrCreateSearchBoxSelectors(iface).getQuery;
};

export {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
