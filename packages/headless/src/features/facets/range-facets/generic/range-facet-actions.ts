import {
  RangeFacetRangeAlgorithm,
  RangeFacetSortCriterion,
} from './interfaces/request';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload';
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
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<RangeFacetSortCriterion>({required: true}),
    })
);

/**
 * Updates the range algorithm of a range facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param rangeAlgorithm (RangeFacetRangeAlgorithm) The target range algorithm.
 */
export const updateRangeFacetRangeAlgorithm = createAction(
  'rangeFacet/updateRangeAlgorithm',
  (payload: {facetId: string; rangeAlgorithm: RangeFacetRangeAlgorithm}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      rangeAlgorithm: new Value<RangeFacetRangeAlgorithm>({required: true}),
    })
);
