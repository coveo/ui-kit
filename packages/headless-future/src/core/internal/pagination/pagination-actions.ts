import {createAction} from '@reduxjs/toolkit';

const ACTION_PREFIX = 'pagination';

export const setPage = createAction<number>(`${ACTION_PREFIX}/setPage`);

export const setPageSize = createAction<number>(`${ACTION_PREFIX}/setPageSize`);

export const setTotalCount = createAction<number>(
  `${ACTION_PREFIX}/setTotalCount`
);

export const nextPage = createAction(`${ACTION_PREFIX}/nextPage`);

export const previousPage = createAction(`${ACTION_PREFIX}/previousPage`);

export const resetToFirstPage = createAction(
  `${ACTION_PREFIX}/resetToFirstPage`
);
