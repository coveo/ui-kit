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

export const toggleSelectDateFacetValue = createAction(
  'commerce/facets/dateFacet/toggleSelectValue',
  (payload: ToggleSelectDateFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: dateFacetValueDefinition}),
    })
);

export type ToggleExcludeDateFacetValueActionCreatorPayload =
  ToggleSelectDateFacetValueActionCreatorPayload;

export const toggleExcludeDateFacetValue = createAction(
  'commerce/facets/dateFacet/toggleExcludeValue',
  (payload: ToggleExcludeDateFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: dateFacetValueDefinition}),
    })
);

export const updateDateFacetValues = createAction(
  'commerce/facets/dateFacet/updateFacetValues',
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
