import {RecordValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkOptions} from '../../../app/async-thunk-options.js';
import type {
  ConfigurationSection,
  FacetSection,
} from '../../../state/state-sections.js';
import {updateFacetOptions} from '../../facet-options/facet-options-actions.js';
import {facetIdDefinition} from '../generic/facet-actions-validation.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './facet-set-actions.js';
import {facetValueDefinition} from './facet-set-validate-payload.js';
import type {FacetValue} from './interfaces/response.js';

const definition = {
  facetId: facetIdDefinition,
  selection: new RecordValue({values: facetValueDefinition}),
};

export const executeToggleFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: FacetValue;
  },
  AsyncThunkOptions<FacetSection & ConfigurationSection>
>('facet/executeToggleSelect', ({facetId, selection}, thunk) => {
  const {
    dispatch,
    extra: {validatePayload},
  } = thunk;
  validatePayload({facetId, selection}, definition);
  dispatch(toggleSelectFacetValue({facetId, selection}));
  dispatch(updateFacetOptions());
});

export const executeToggleFacetExclude = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: FacetValue;
  },
  AsyncThunkOptions<FacetSection & ConfigurationSection>
>('facet/executeToggleExclude', ({facetId, selection}, thunk) => {
  const {
    dispatch,
    extra: {validatePayload},
  } = thunk;
  validatePayload({facetId, selection}, definition);
  dispatch(toggleExcludeFacetValue({facetId, selection}));
  dispatch(updateFacetOptions());
});
