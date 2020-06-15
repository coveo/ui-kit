import {createAction} from '@reduxjs/toolkit';

/**
 * Initializes the number of results. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-numberOfResults}
 * @param number The initial number of results.
 */
export const registerNumberOfResults = createAction<number>(
  'pagination/registerNumberOfResults'
);

/**
 * Updates the number of results.
 * @param number The updated number of results.
 */
export const updateNumberOfResults = createAction<number>(
  'pagination/updateNumberOfResults'
);

/**
 * Sets the initial page by initializing the firstResult property. For more information on firstResult, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-firstResult}
 * @param number The initial page number.
 */
export const registerPage = createAction<number>('pagination/registerPage');

/**
 * Updates the page by setting the firstResult property.
 * @param number The new page number.
 */
export const updatePage = createAction<number>('pagination/updatePage');
