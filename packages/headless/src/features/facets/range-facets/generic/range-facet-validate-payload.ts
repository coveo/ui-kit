import * as z from '@coveo/bueno/zod';
import {requiredNonEmptyString} from '../../../../utils/validate-payload.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import type {RangeFacetValue} from './interfaces/range-facet.js';

export const numericFacetValueDefinition = z.object({
  state: z.enum(['idle', 'selected', 'excluded']),
  start: z.number(),
  end: z.number(),
  endInclusive: z.boolean(),
  numberOfResults: z.number().check(z.minimum(0)),
});

export const dateFacetValueDefinition = z.object({
  start: requiredNonEmptyString,
  end: requiredNonEmptyString,
  endInclusive: z.boolean(),
  state: z.enum(['idle', 'selected', 'excluded']),
  numberOfResults: z.number().check(z.minimum(0)),
});

export const rangeFacetSelectionPayloadDefinition = (
  selection: RangeFacetValue
) =>
  z.object({
    facetId: facetIdDefinition,
    selection:
      typeof selection.start === 'string'
        ? dateFacetValueDefinition
        : numericFacetValueDefinition,
  });

export interface RangeFacetSelectionPayload {
  facetId: string;
  selection: RangeFacetValue;
}
