import {createAsyncThunk} from '@reduxjs/toolkit';
import {FacetValue} from './interfaces/response';
import {
  ConfigurationSection,
  FacetSection,
} from '../../../state/state-sections';
import {updateFacetOptions} from '../../facet-options/facet-options-actions';
import {toggleSelectFacetValue} from './facet-set-actions';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RecordValue} from '@coveo/bueno';
import {facetValueDefinition} from './facet-set-validate-payload';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';

const definition = {
  facetId: facetIdDefinition,
  selection: new RecordValue({values: facetValueDefinition}),
};

/**
 * Toggles the facet value and then executes a search with the appropriate analytics tag.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (FacetValue) The target facet value.
 */
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
  dispatch(updateFacetOptions({freezeFacetOrder: true}));
});
