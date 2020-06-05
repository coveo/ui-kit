import {createAction} from '@reduxjs/toolkit';

/**
 * Initializes the number of results. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-numberOfResults}
 * @param number The initial number of results.
 */
export const registerNumberOfResults = createAction<number>(
  'numberOfResults/register'
);

/**
 * Updates the number of results.
 * @param number The updated number of results.
 */
export const updateNumberOfResults = createAction<number>(
  'numberOfResults/update'
);
