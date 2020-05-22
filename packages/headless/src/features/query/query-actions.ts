import {createAction} from '@reduxjs/toolkit';

/**
 * Update the basic query expression.
 * @param q The new basic query expression (e.g., `acme tornado seeds`).
 */
export const updateQuery = createAction<{q: string}>('query/updateQuery');
