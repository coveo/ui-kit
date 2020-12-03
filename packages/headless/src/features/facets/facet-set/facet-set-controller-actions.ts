import {createAsyncThunk} from '@reduxjs/toolkit';
import {FacetValue} from './interfaces/response';
import {AsyncThunkSearchOptions} from '../../../api/search/search-api-client';
import {
  ConfigurationSection,
  FacetSection,
} from '../../../state/state-sections';
import {getAnalyticsActionForToggleFacetSelect} from './facet-set-utils';
import {updateFacetOptions} from '../../facet-options/facet-options-actions';
import {executeSearch} from '../../search/search-actions';
import {toggleSelectFacetValue} from './facet-set-actions';
import {validateThunkActionPayload} from '../../../utils/validate-payload';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RecordValue} from '@coveo/bueno';
import {facetValueDefinition} from './facet-set-validate-payload';

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
  AsyncThunkSearchOptions<FacetSection & ConfigurationSection>
>('facet/executeToggleSelect', ({facetId, selection}, {dispatch}) => {
  const analyticsAction = getAnalyticsActionForToggleFacetSelect(
    facetId,
    selection
  );
  validateThunkActionPayload(
    {facetId, selection},
    {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: facetValueDefinition}),
    }
  );
  dispatch(toggleSelectFacetValue({facetId, selection}));
  dispatch(updateFacetOptions({freezeFacetOrder: true}));
  dispatch(executeSearch(analyticsAction));
});
