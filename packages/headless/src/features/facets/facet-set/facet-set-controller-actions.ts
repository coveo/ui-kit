import {AnyAction, createAsyncThunk, ThunkDispatch} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../../api/search/search-api-client';
import {
  ConfigurationSection,
  FacetSection,
} from '../../../state/state-sections';
import {getAnalyticsActionForToggleFacetSelect} from './facet-set-utils';
import {updateFacetOptions} from '../../facet-options/facet-options-actions';
import {executeSearch} from '../../search/search-actions';
import {
  toggleSelectFacetValue,
  toggleSingleSelectFacetValue,
  ToggleSelectFacetValueActionCreatorPayload,
} from './facet-set-actions';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RecordValue} from '@coveo/bueno';
import {facetValueDefinition} from './facet-set-validate-payload';

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
  ToggleSelectFacetValueActionCreatorPayload,
  AsyncThunkSearchOptions<FacetSection & ConfigurationSection>
>(
  'facet/executeToggleSelect',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSelectFacetValue(payload));
    commonExecuteToggleFacet(payload, dispatch);
  }
);

/**
 * Toggles the facet value, deselect other facet values, and then executes a search with the appropriate analytics tag.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (FacetValue) The target facet value.
 */
export const executeToggleFacetSingleSelect = createAsyncThunk<
  void,
  ToggleSelectFacetValueActionCreatorPayload,
  AsyncThunkSearchOptions<FacetSection & ConfigurationSection>
>(
  'facet/executeToggleFacetSingleSelect',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSingleSelectFacetValue(payload));
    commonExecuteToggleFacet(payload, dispatch);
  }
);

function commonExecuteToggleFacet(
  {facetId, selection}: ToggleSelectFacetValueActionCreatorPayload,
  dispatch: ThunkDispatch<never, never, AnyAction>
) {
  const analyticsAction = getAnalyticsActionForToggleFacetSelect(
    facetId,
    selection
  );
  dispatch(updateFacetOptions({freezeFacetOrder: true}));
  dispatch(executeSearch(analyticsAction));
}
