import {RecordValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';
import {
  ConfigurationSection,
  FacetSection,
} from '../../../state/state-sections';
import {updateFacetOptions} from '../../facet-options/facet-options-actions';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './facet-set-actions';
import {facetValueDefinition} from './facet-set-validate-payload';
import {FacetValue} from './interfaces/response';

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
