import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import type {RangeFacetSortCriterion} from './interfaces/request.js';

export const updateRangeFacetSortCriterion = createAction(
  'rangeFacet/updateSortCriterion',
  (payload: {facetId: string; criterion: RangeFacetSortCriterion}) =>
    validatePayload(
      payload,
      z.object({
        facetId: facetIdDefinition,
        criterion: z.unknown(),
      })
    )
);
