import {createAsyncThunk} from '@reduxjs/toolkit';
import {RangeFacetValue} from './interfaces/range-facet';
import {AsyncThunkSearchOptions} from '../../../../api/search/search-api-client';
import {ConfigurationSection} from '../../../../state/state-sections';
import {getAnalyticsActionForToggleRangeFacetSelect} from './range-facet-utils';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {executeSearch} from '../../../search/search-actions';
import {RecordValue} from '@coveo/bueno';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {
  numericFacetValueDefinition,
  dateFacetValueDefinition,
} from './range-facet-validate-payload';
import {logRangeFacetBreadcrumb} from './range-facet-analytics-actions';

export const rangeFacetSelectionPayloadDefinition = (
  selection: RangeFacetValue
) => ({
  facetId: facetIdDefinition,
  selection:
    typeof selection.start === 'string'
      ? new RecordValue({values: dateFacetValueDefinition})
      : new RecordValue({values: numericFacetValueDefinition}),
});

export interface RangeFacetSelectionPayload {
  facetId: string;
  selection: RangeFacetValue;
}

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

/**
 * Executes a search with the appropriate analytics for a range facet breadcrumb
 * @param payload (RangeFacetSelectionPayload) Object specifying the target facet and selection.
 */
export const executeRangeFacetBreadcrumb = createAsyncThunk<
  void,
  RangeFacetSelectionPayload,
  AsyncThunkSearchOptions<ConfigurationSection>
>(
  'rangeFacet/executeRangeFacetBreadcrumb',
  ({facetId, selection}, {dispatch, extra: {validatePayload}}) => {
    validatePayload(
      {facetId, selection},
      rangeFacetSelectionPayloadDefinition(selection)
    );

    const analyticsAction = logRangeFacetBreadcrumb({
      facetId,
      selection,
    });
    dispatch(executeSearch(analyticsAction));
  }
);
