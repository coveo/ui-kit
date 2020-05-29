import {createAction} from '@reduxjs/toolkit';

/**
 * Register a query in the query set.
 * @param id The unique identifier of the target query.
 * @param query The initial basic query expression.
 */
export const registerQuerySetQuery = createAction<{id: string; query: string}>(
  'querySet/register'
);

/**
 * Update a query in the query set.
 * @param id The unique identifier of the target query.
 * @param q The updated basic query expression.
 */
export const updateQuerySetQuery = createAction<{id: string; query: string}>(
  'querySet/update'
);
