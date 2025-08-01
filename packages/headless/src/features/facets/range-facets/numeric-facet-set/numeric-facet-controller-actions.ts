import {RecordValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkOptions} from '../../../../app/async-thunk-options.js';
import type {
  ConfigurationSection,
  NumericFacetSection,
} from '../../../../state/state-sections.js';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import {
  executeToggleRangeFacetExclude,
  executeToggleRangeFacetSelect,
} from '../generic/range-facet-controller-actions.js';
import {numericFacetValueDefinition} from '../generic/range-facet-validate-payload.js';
import type {NumericFacetValue} from './interfaces/response.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from './numeric-facet-actions.js';

const definition = {
  facetId: facetIdDefinition,
  selection: new RecordValue({values: numericFacetValueDefinition}),
};

export const executeToggleNumericFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: NumericFacetValue;
  },
  AsyncThunkOptions<ConfigurationSection & NumericFacetSection>
>(
  'numericFacet/executeToggleSelect',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSelectNumericFacetValue(payload));
    dispatch(executeToggleRangeFacetSelect(payload));
    dispatch(updateFacetOptions());
  }
);

export const executeToggleNumericFacetExclude = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: NumericFacetValue;
  },
  AsyncThunkOptions<ConfigurationSection & NumericFacetSection>
>(
  'numericFacet/executeToggleExclude',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleExcludeNumericFacetValue(payload));
    dispatch(executeToggleRangeFacetExclude(payload));
    dispatch(updateFacetOptions());
  }
);
