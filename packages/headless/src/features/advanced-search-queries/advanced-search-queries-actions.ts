import {createAction} from '@reduxjs/toolkit';
import {AdvancedSearchQueriesState} from '../../state';

/**
 * Update the values of the advanced search queries.
 * @param (advancedSearchQueries)  The current state of the advanced search queries.
 */
export const updateAdvancedSearchQueries = createAction<
  Partial<AdvancedSearchQueriesState>
>('advancedSearchQueries/update');
