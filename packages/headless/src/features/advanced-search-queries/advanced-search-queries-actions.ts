import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

export interface AdvancedSearchQueryActionCreatorPayload {
  /**
   * The advanced query.
   */
  aq?: string;

  /**
   * The constant query.
   */
  cq?: string;

  /**
   * The large query.
   */
  lq?: string;
}

export const updateAdvancedSearchQueries = createAction(
  'advancedSearchQueries/update',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, {
      aq: new StringValue({required: false, emptyAllowed: true}),
      cq: new StringValue({required: false, emptyAllowed: true}),
      lq: new StringValue({required: false, emptyAllowed: true}),
    })
);

export const registerAdvancedSearchQueries = createAction(
  'advancedSearchQueries/register',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, {
      aq: new StringValue({required: false, emptyAllowed: true}),
      cq: new StringValue({required: false, emptyAllowed: true}),
      lq: new StringValue({required: false, emptyAllowed: true}),
    })
);
