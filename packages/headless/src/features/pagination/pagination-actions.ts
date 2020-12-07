import {createAction} from '@reduxjs/toolkit';
import {NumberValue} from '@coveo/bueno';
import {validatePayload} from '../../utils/validate-payload';

const numberValue = new NumberValue({required: true, min: 0});

/**
 * Initializes the `numberOfResults` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-numberOfResults).
 * @param payload (number) The initial number of results.
 */
export const registerNumberOfResults = createAction(
  'pagination/registerNumberOfResults',
  (payload: number) => validatePayload(payload, numberValue)
);

/**
 * Updates the `numberOfResults` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-numberOfResults).
 * @param payload (number) The new number of results.
 */
export const updateNumberOfResults = createAction(
  'pagination/updateNumberOfResults',
  (payload: number) => validatePayload(payload, numberValue)
);

/**
 * Sets the initial page by initializing the `firstResult` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-firstResult).
 * @param payload (number) The initial page number.
 */
export const registerPage = createAction(
  'pagination/registerPage',
  (payload: number) => validatePayload(payload, numberValue)
);

/**
 * Updates the page by updating the `firstResult` query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-firstResult).
 * @param payload (number) The new page number.
 */
export const updatePage = createAction(
  'pagination/updatePage',
  (payload: number) => validatePayload(payload, numberValue)
);

/**
 * Updates the page to the next page.
 */
export const nextPage = createAction('pagination/nextPage');

/**
 * Updates the page to the previous page.
 */
export const previousPage = createAction('pagination/previousPage');
