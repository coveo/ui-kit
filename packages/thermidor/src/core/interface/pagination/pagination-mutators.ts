import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

export const setFirstResult = (
  firstResult: number,
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreatePaginationActions(iface);
  return actions.setFirstResult(firstResult);
};

export const setPageSize = (
  pageSize: number,
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreatePaginationActions(iface);
  return actions.setPageSize(pageSize);
};

export const setTotalCount = (
  totalCount: number,
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreatePaginationActions(iface);
  return actions.setTotalCount(totalCount);
};
