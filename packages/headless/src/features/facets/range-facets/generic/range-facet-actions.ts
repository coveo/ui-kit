import {Value} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload';
import {FacetResultsMustMatch} from '../../facet-api/request';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {RangeFacetSortCriterion} from './interfaces/request';

export const updateRangeFacetSortCriterion = createAction(
  'rangeFacet/updateSortCriterion',
  (payload: {facetId: string; criterion: RangeFacetSortCriterion}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<RangeFacetSortCriterion>({required: true}),
    })
);

export const updateRangeFacetMatchCriterion = createAction(
  'rangeFacet/updateMatchCriterion',
  (payload: {facetId: string; criterion: FacetResultsMustMatch}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<FacetResultsMustMatch>({required: true}),
    })
);
