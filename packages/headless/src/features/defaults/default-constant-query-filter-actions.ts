import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

/**
 * Sets the default constant query filter.
 * @param (string)  The desired default constant query filter.
 */
export const setDefaultConstantQueryFilter = createAction(
  'advancedSearchQueries/setDefaultConstantQuery',
  (payload: string) =>
    validatePayload(
      payload,
      new StringValue({required: true, emptyAllowed: true})
    )
);
