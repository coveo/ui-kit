import {Value} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload';
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
