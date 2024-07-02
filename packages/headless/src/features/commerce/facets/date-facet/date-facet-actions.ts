import {ArrayValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload';
import {
  ToggleSelectDateFacetValueActionCreatorPayload,
  UpdateDateFacetValuesActionCreatorPayload,
  validateManualDateRanges,
} from '../../../facets/range-facets/date-facet-set/date-facet-actions';
import {dateFacetValueDefinition} from '../../../facets/range-facets/generic/range-facet-validate-payload';

export type ToggleSelectDateFacetValuePayload =
  ToggleSelectDateFacetValueActionCreatorPayload;

export const toggleSelectDateFacetValue = createAction(
  'commerce/facets/dateFacet/toggleSelectValue',
  (payload: ToggleSelectDateFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: dateFacetValueDefinition}),
    })
);

export type ToggleExcludeDateFacetValuePayload =
  ToggleSelectDateFacetValueActionCreatorPayload;

export const toggleExcludeDateFacetValue = createAction(
  'commerce/facets/dateFacet/toggleExcludeValue',
  (payload: ToggleExcludeDateFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: dateFacetValueDefinition}),
    })
);

export type UpdateDateFacetValuesPayload =
  UpdateDateFacetValuesActionCreatorPayload;

export const updateDateFacetValues = createAction(
  'commerce/facets/dateFacet/updateValues',
  (payload: UpdateDateFacetValuesActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(payload, {
        facetId: requiredNonEmptyString,
        values: new ArrayValue({
          each: new RecordValue({values: dateFacetValueDefinition}),
        }),
      });
      validateManualDateRanges({currentValues: payload.values});
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);
