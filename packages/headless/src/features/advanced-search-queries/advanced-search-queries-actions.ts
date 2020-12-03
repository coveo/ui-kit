import {createAction} from '@reduxjs/toolkit';
import {validateActionPayload} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

/**
 * Update the values of the advanced search queries.
 * @param (advancedSearchQueries)  The current state of the advanced search queries.
 */
export const updateAdvancedSearchQueries = createAction(
  'advancedSearchQueries/update',
  (payload: {aq?: string; cq?: string}) =>
    validateActionPayload(payload, {
      aq: new StringValue({required: false, emptyAllowed: true}),
      cq: new StringValue({required: false, emptyAllowed: true}),
    })
);
