import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../../../api/search/search-api-client';
import {ConfigurationSection} from '../../../../state/state-sections';
import {getAnalyticsActionForToggleRangeFacetSelect} from './range-facet-utils';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {executeSearch} from '../../../search/search-actions';
import {
  RangeFacetSelectionPayload,
  rangeFacetSelectionPayloadDefinition,
} from './range-facet-validate-payload';

/**
 * Executes a search with the appropriate analytics for a toggle range facet value
 * @param payload (RangeFacetSelectionPayload) Object specifying the target facet and selection.
 */
export const executeToggleRangeFacetSelect = createAsyncThunk<
  void,
  RangeFacetSelectionPayload,
  AsyncThunkSearchOptions<ConfigurationSection>
>(
  'rangeFacet/executeToggleSelect',
  ({facetId, selection}, {dispatch, extra: {validatePayload}}) => {
    validatePayload(
      {facetId, selection},
      rangeFacetSelectionPayloadDefinition(selection)
    );

    const analyticsAction = getAnalyticsActionForToggleRangeFacetSelect(
      facetId,
      selection
    );

    dispatch(updateFacetOptions({freezeFacetOrder: true}));
    dispatch(executeSearch(analyticsAction));
  }
);
