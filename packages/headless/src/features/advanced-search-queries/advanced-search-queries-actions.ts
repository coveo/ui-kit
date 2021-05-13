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
}

/**
 * Update the values of the advanced search queries.
 * @param (advancedSearchQueries)  The current state of the advanced search queries.
 */
export const updateAdvancedSearchQueries = createAction(
  'advancedSearchQueries/update',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, {
      aq: new StringValue({required: false, emptyAllowed: true}),
      cq: new StringValue({required: false, emptyAllowed: true}),
    })
);

/**
 * Registers the initial state of the advanced search queries.
 * @param (advancedSearchQueries)  The initial state of the advanced search queries.
 */
export const registerAdvancedSearchQueries = createAction(
  'advancedSearchQueries/register',
  (payload: AdvancedSearchQueryActionCreatorPayload) =>
    validatePayload(payload, {
      aq: new StringValue({required: false, emptyAllowed: true}),
      cq: new StringValue({required: false, emptyAllowed: true}),
    })
);
