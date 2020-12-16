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
import {
  toggleSelectFacetValue,
  selectFacetBreadcrumb,
} from './facet-set-actions';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RecordValue} from '@coveo/bueno';
import {facetValueDefinition} from './facet-set-validate-payload';
import {logFacetBreadcrumb} from './facet-set-analytics-actions';

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
  AsyncThunkSearchOptions<FacetSection & ConfigurationSection>
>(
  'facet/executeToggleSelect',
  ({facetId, selection}, {dispatch, extra: {validatePayload}}) => {
    const analyticsAction = getAnalyticsActionForToggleFacetSelect(
      facetId,
      selection
    );
    validatePayload({facetId, selection}, definition);
    dispatch(toggleSelectFacetValue({facetId, selection}));
    dispatch(updateFacetOptions({freezeFacetOrder: true}));
    dispatch(executeSearch(analyticsAction));
  }
);

/**
 * Selects the breadcrumb facet value and then executes a search with the appropriate analytics tag.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (FacetValue) The target facet value.
 */
export const executeSelectFacetBreadcrumb = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: FacetValue;
  },
  AsyncThunkSearchOptions<FacetSection & ConfigurationSection>
>(
  'facet/executeSelectFacetBreadcrumb',
  ({facetId, selection}, {dispatch, extra: {validatePayload}}) => {
    const analyticsAction = logFacetBreadcrumb({
      facetId: facetId,
      facetValue: selection.value,
    });
    validatePayload({facetId, selection}, definition);
    dispatch(selectFacetBreadcrumb({facetId, selection}));
    dispatch(executeSearch(analyticsAction));
  }
);
