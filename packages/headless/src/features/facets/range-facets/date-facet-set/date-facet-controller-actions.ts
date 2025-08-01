import {RecordValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkOptions} from '../../../../app/async-thunk-options.js';
import type {
  ConfigurationSection,
  DateFacetSection,
} from '../../../../state/state-sections.js';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import {
  executeToggleRangeFacetExclude,
  executeToggleRangeFacetSelect,
} from '../generic/range-facet-controller-actions.js';
import {dateFacetValueDefinition} from '../generic/range-facet-validate-payload.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from './date-facet-actions.js';
import type {DateFacetValue} from './interfaces/response.js';

const definition = {
  facetId: facetIdDefinition,
  selection: new RecordValue({values: dateFacetValueDefinition}),
};

export const executeToggleDateFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: DateFacetValue;
  },
  AsyncThunkOptions<ConfigurationSection & DateFacetSection>
>(
  'dateFacet/executeToggleSelect',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSelectDateFacetValue(payload));
    dispatch(executeToggleRangeFacetSelect(payload));
    dispatch(updateFacetOptions());
  }
);

export const executeToggleDateFacetExclude = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: DateFacetValue;
  },
  AsyncThunkOptions<ConfigurationSection & DateFacetSection>
>(
  'dateFacet/executeToggleExclude',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleExcludeDateFacetValue(payload));
    dispatch(executeToggleRangeFacetExclude(payload));
    dispatch(updateFacetOptions());
  }
);
