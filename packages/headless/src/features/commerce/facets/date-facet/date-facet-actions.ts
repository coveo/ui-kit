import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload.js';
import {
  type ToggleSelectDateFacetValueActionCreatorPayload,
  type UpdateDateFacetValuesActionCreatorPayload,
  validateManualDateRanges,
} from '../../../facets/range-facets/date-facet-set/date-facet-actions.js';
import {dateFacetValueDefinition} from '../../../facets/range-facets/generic/range-facet-validate-payload.js';

export type ToggleSelectDateFacetValuePayload =
  ToggleSelectDateFacetValueActionCreatorPayload;

export const toggleSelectDateFacetValue = createAction(
  'commerce/facets/dateFacet/toggleSelectValue',
  (payload: ToggleSelectDateFacetValuePayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        selection: dateFacetValueDefinition,
      })
    )
);

export type ToggleExcludeDateFacetValuePayload =
  ToggleSelectDateFacetValueActionCreatorPayload;

export const toggleExcludeDateFacetValue = createAction(
  'commerce/facets/dateFacet/toggleExcludeValue',
  (payload: ToggleExcludeDateFacetValuePayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        selection: dateFacetValueDefinition,
      })
    )
);

export type UpdateDateFacetValuesPayload =
  UpdateDateFacetValuesActionCreatorPayload;

export const updateDateFacetValues = createAction(
  'commerce/facets/dateFacet/updateValues',
  (payload: UpdateDateFacetValuesActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(
        payload,
        z.object({
          facetId: requiredNonEmptyString,
          values: z.array(dateFacetValueDefinition),
        })
      );
      validateManualDateRanges({currentValues: payload.values});
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);
