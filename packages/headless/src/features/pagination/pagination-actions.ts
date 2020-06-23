import {createAction} from '@reduxjs/toolkit';
import {NumberValue} from '@coveo/bueno';
import {validatePayloadValue} from '../../utils/validate-payload';

const numberValue = new NumberValue({required: true, min: 0});

/**
 * Initializes the number of results. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-numberOfResults}
 * @param number The initial number of results.
 */
export const registerNumberOfResults = createAction(
  'pagination/registerNumberOfResults',
  (payload: number) => validatePayloadValue(payload, numberValue)
);

/**
 * Updates the number of results.
 * @param number The updated number of results.
 */
export const updateNumberOfResults = createAction(
  'pagination/updateNumberOfResults',
  (payload: number) => validatePayloadValue(payload, numberValue)
);

/**
 * Sets the initial page by initializing the firstResult property. For more information on firstResult, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-firstResult}
 * @param number The initial page number.
 */
export const registerPage = createAction(
  'pagination/registerPage',
  (payload: number) => validatePayloadValue(payload, numberValue)
);

/**
 * Updates the page by setting the firstResult property.
 * @param number The new page number.
 */
export const updatePage = createAction(
  'pagination/updatePage',
  (payload: number) => validatePayloadValue(payload, numberValue)
);

/**
 * Updates the page to the next page.
 */
export const nextPage = createAction('pagination/nextPage');

/**
 * Updates the page to the previous page.
 */
export const previousPage = createAction('pagination/previousPage');
