import {createAsyncThunk} from '@reduxjs/toolkit';
import {CategoryFacetValue} from './interfaces/response';
import {AsyncThunkSearchOptions} from '../../../api/search/search-api-client';
import {
  CategoryFacetSection,
  ConfigurationSection,
} from '../../../state/state-sections';
import {getAnalyticsActionForCategoryFacetToggleSelect} from './category-facet-utils';
import {updateFacetOptions} from '../../facet-options/facet-options-actions';
import {executeSearch} from '../../search/search-actions';
import {logFacetClearAll} from '../facet-set/facet-set-analytics-actions';
import {
  deselectAllCategoryFacetValues,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from './category-facet-set-actions';

/**
 * Toggles the facet value and then executes a search with the appropriate analytics tag.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (CategoryFacetValue) The target facet value.
 */
export const executeToggleCategoryFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: CategoryFacetValue;
  },
  AsyncThunkSearchOptions<CategoryFacetSection & ConfigurationSection>
>(
  'categoryFacetController/executeToggleSelect',
  ({facetId, selection}, {dispatch}) => {
    const analyticsAction = getAnalyticsActionForCategoryFacetToggleSelect(
      facetId,
      selection
    );

    dispatch(toggleSelectCategoryFacetValue({facetId, selection}));
    dispatch(updateFacetOptions({freezeFacetOrder: true}));
    dispatch(executeSearch(analyticsAction));
  }
);

/**
 * Deselects the all values on the path to the currently selected category facet value and executes
 * a search with the appropriate analytics
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param numberOfValues (number) The number of category facet values to show after deselecting.
 */
export const executeDeselectAllCategoryFacetValues = createAsyncThunk<
  void,
  {facetId: string; numberOfValues: number},
  AsyncThunkSearchOptions<CategoryFacetSection & ConfigurationSection>
>(
  'categoryFacetController/executeDeselectAll',
  ({facetId, numberOfValues}, {dispatch}) => {
    dispatch(deselectAllCategoryFacetValues(facetId));
    dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
    dispatch(updateFacetOptions({freezeFacetOrder: true}));
    dispatch(executeSearch(logFacetClearAll(facetId)));
  }
);
