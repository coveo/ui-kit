import {createAction} from '@reduxjs/toolkit';
import {StringValue} from '../../utils/bueno-zod.js';
import {validatePayload} from '../../utils/validate-payload.js';

const optionalAndPossiblyEmpty = () =>
  new StringValue({required: false, emptyAllowed: true});
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

  /**
   * The disjunction query
   */
  dq?: string;
}

export const updateAdvancedSearchQueries = createAction(
  'advancedSearchQueries/update',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, {
      aq: optionalAndPossiblyEmpty(),
      cq: optionalAndPossiblyEmpty(),
      lq: optionalAndPossiblyEmpty(),
      dq: optionalAndPossiblyEmpty(),
    })
);

export const registerAdvancedSearchQueries = createAction(
  'advancedSearchQueries/register',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, {
      aq: optionalAndPossiblyEmpty(),
      cq: optionalAndPossiblyEmpty(),
      lq: optionalAndPossiblyEmpty(),
      dq: optionalAndPossiblyEmpty(),
    })
);
