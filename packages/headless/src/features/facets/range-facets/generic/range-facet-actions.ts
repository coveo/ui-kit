import {RangeFacetSortCriterion} from './interfaces/request';
import {createAction} from '@reduxjs/toolkit';
import {validatePayloadSchema} from '../../../../utils/validate-payload';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {Value} from '@coveo/bueno';

/**
 * Updates the sort criterion of a range facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (RangeFacetSortCriterion) The target criterion.
 */
export const updateRangeFacetSortCriterion = createAction(
  'rangeFacet/updateSortCriterion',
  (payload: {facetId: string; criterion: RangeFacetSortCriterion}) =>
    validatePayloadSchema(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<RangeFacetSortCriterion>({required: true}),
    })
);
