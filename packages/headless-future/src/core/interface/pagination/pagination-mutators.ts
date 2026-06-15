import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';

const defaultActions = getOrCreatePaginationActions('default');

export const setFirstResult = (firstResult: number): StateMutation => {
  return defaultActions.setFirstResult(firstResult);
};

export const setPageSize = (pageSize: number): StateMutation => {
  return defaultActions.setPageSize(pageSize);
};

export const setTotalCount = (totalCount: number): StateMutation => {
  return defaultActions.setTotalCount(totalCount);
};
