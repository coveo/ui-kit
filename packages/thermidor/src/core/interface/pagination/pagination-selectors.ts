import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

export const getFirstResult = (iface: InterfaceHandle) => {
  return getOrCreatePaginationSelectors(iface).getFirstResult;
};

export const getPageSize = (iface: InterfaceHandle) => {
  return getOrCreatePaginationSelectors(iface).getPageSize;
};

export const getTotalCount = (iface: InterfaceHandle) => {
  return getOrCreatePaginationSelectors(iface).getTotalCount;
};
