import {createAsyncThunk} from '@reduxjs/toolkit';
import {RangeFacetValue} from './interfaces/range-facet';
import {AsyncThunkSearchOptions} from '../../../../api/search/search-api-client';
import {ConfigurationSection} from '../../../../state/state-sections';
import {
  getAnalyticsActionForToggleRangeFacetSelect,
  getAnalyticsRangeValue,
} from './range-facet-utils';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {executeSearch} from '../../../search/search-actions';
import {RecordValue} from '@coveo/bueno';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {
  numericFacetValueDefinition,
  dateFacetValueDefinition,
} from './range-facet-validate-payload';
import {logFacetBreadcrumb} from '../../facet-set/facet-set-analytics-actions';

const definition = (selection: RangeFacetValue) => ({
  facetId: facetIdDefinition,
  selection:
    typeof selection.start === 'string'
      ? new RecordValue({values: dateFacetValueDefinition})
      : new RecordValue({values: numericFacetValueDefinition}),
});

/**
 * Executes a search with the appropriate analytics for a toggle range facet value
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (RangeFacetValue) The target range facet value.
 */
export const executeToggleRangeFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: RangeFacetValue;
  },
  AsyncThunkSearchOptions<ConfigurationSection>
>(
  'rangeFacet/executeToggleSelect',
  ({facetId, selection}, {dispatch, extra: {validatePayload}}) => {
    validatePayload({facetId, selection}, definition(selection));

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
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (RangeFacetValue) The target range facet value.
 */
export const executeRangeFacetBreadcrumb = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: RangeFacetValue;
  },
  AsyncThunkSearchOptions<ConfigurationSection>
>(
  'rangeFacet/executeRangeFacetBreadcrumb',
  ({facetId, selection}, {dispatch, extra: {validatePayload}}) => {
    validatePayload({facetId, selection}, definition(selection));

    const analyticsAction = logFacetBreadcrumb({
      facetId,
      facetValue: getAnalyticsRangeValue(selection),
    });
    dispatch(executeSearch(analyticsAction));
  }
);
