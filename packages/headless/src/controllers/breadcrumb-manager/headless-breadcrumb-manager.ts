import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
import {BaseFacetValue} from '../../features/facets/facet-api/response';
import {FacetValue} from '../../features/facets/facet-set/interfaces/response';
import {CategoryFacetValue} from '../../features/facets/category-facet-set/interfaces/response';
import {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response';
import {facetResponseSelectedValuesSelector} from '../../features/facets/facet-set/facet-set-selectors';
import {categoryFacetSelectedValuesSelector} from '../../features/facets/category-facet-set/category-facet-set-selectors';
import {numericFacetSelectedValuesSelector} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors';
import {dateFacetSelectedValuesSelector} from '../../features/facets/range-facets/date-facet-set/date-facet-selectors';
import {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../state/state-sections';
import {BaseFacetRequest} from '../../features/facets/facet-api/request';
import {AsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {executeDeselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-controller-actions';
import {executeToggleFacetSelect} from '../../features/facets/facet-set/facet-set-controller-actions';
import {executeToggleNumericFacetSelect} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions';
import {executeToggleDateFacetSelect} from '../../features/facets/range-facets/date-facet-set/date-facet-controller-actions';
import {executeSearch} from '../../features/search/search-actions';
import {deselectAllFacets} from '../../features/facets/generic/facet-actions';
import {logClearBreadcrumbs} from '../../features/facets/generic/facet-generic-analytics-actions';

export type BreadcrumbManager = ReturnType<typeof buildBreadcrumbManager>;

/**
 * A scoped and simplified part of the headless state that is relevant to the `BreadcrumbManager` controller.
 */
export type BreadcrumbManagerState = BreadcrumbManager['state'];

/**
 * The `BreadcrumbManager` headless controller allows to manage a summary of the currently active facets filters.
 */
export const buildBreadcrumbManager = (
  engine: Engine<
    ConfigurationSection &
      SearchSection &
      FacetSection &
      NumericFacetSection &
      DateFacetSection &
      CategoryFacetSection
  >
) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  function getBreadcrumbs<T extends BaseFacetValue>(
    facetSet: Record<string, BaseFacetRequest>,
    executeToggleSelect: AsyncThunk<
      void,
      {facetId: string; selection: T},
      AsyncThunkSearchOptions<ConfigurationSection>
    >,
    facetValuesSelector:
      | ((state: SearchSection & FacetSection, facetId: string) => T[])
      | ((state: SearchSection & NumericFacetSection, facetId: string) => T[])
      | ((state: SearchSection & DateFacetSection, facetId: string) => T[])
  ) {
    return Object.keys(facetSet)
      .map((facetId) => {
        const values = facetValuesSelector(engine.state, facetId).map(
          (selection) => ({
            value: selection,
            deselect: () => dispatch(executeToggleSelect({facetId, selection})),
          })
        );

        return {
          field: facetSet[facetId].field,
          values,
        };
      })
      .filter((breadcrumb) => breadcrumb.values.length);
  }

  function getFacetBreadcrumbs(): FacetBreadcrumb[] {
    return getBreadcrumbs<FacetValue>(
      engine.state.facetSet,
      executeToggleFacetSelect,
      facetResponseSelectedValuesSelector
    );
  }

  function getNumericFacetBreadcrumbs(): NumericFacetBreadcrumb[] {
    return getBreadcrumbs<NumericFacetValue>(
      engine.state.numericFacetSet,
      executeToggleNumericFacetSelect,
      numericFacetSelectedValuesSelector
    );
  }

  function getDateFacetBreadcrumbs(): DateFacetBreadcrumb[] {
    return getBreadcrumbs<DateFacetValue>(
      engine.state.dateFacetSet,
      executeToggleDateFacetSelect,
      dateFacetSelectedValuesSelector
    );
  }

  function getCategoryFacetBreadcrumbs(): CategoryFacetBreadcrumb[] {
    return Object.keys(engine.state.categoryFacetSet)
      .map((facetId) => {
        return {
          field: engine.state.categoryFacetSet[facetId]?.request.field || '',
          path: categoryFacetSelectedValuesSelector(engine.state, facetId),
          deselect: () =>
            dispatch(executeDeselectAllCategoryFacetValues({facetId})),
        };
      })
      .filter((breadcrumb) => breadcrumb.path.length);
  }

  function hasBreadcrumbs() {
    return !![
      ...getFacetBreadcrumbs(),
      ...getNumericFacetBreadcrumbs(),
      ...getDateFacetBreadcrumbs(),
      ...getCategoryFacetBreadcrumbs(),
    ].length;
  }
  return {
    ...controller,

    /**
     * @returns {BreadcrumbManagerState} The state of the `BreadcrumbManager` controller.
     */
    get state() {
      return {
        /**
         * @returns {FacetBreadcrumb[]} The list of specific facet breadcrumbs.
         */
        facetBreadcrumbs: getFacetBreadcrumbs(),
        /**
         * @return {CategoryFacetBreadcrumb[]} The list of category facet breadcrumbs.
         */
        categoryFacetBreadcrumbs: getCategoryFacetBreadcrumbs(),
        /**
         * @returns {NumericFacetBreadcrumb[]} The list of numeric facet breadcrumbs.
         */
        numericFacetBreadcrumbs: getNumericFacetBreadcrumbs(),
        /**
         * @returns {DateFacetBreadcrumb[]} The list of date facet breadcrumbs.
         */
        dateFacetBreadcrumbs: getDateFacetBreadcrumbs(),
      };
    },
    /**
     * Determines if there's any available breadcrumbs, or active facets.
     */
    hasBreadcrumbs,
    /**
     * Allows to deselect and clear all facet filters.
     */
    deselectAll: () => {
      dispatch(deselectAllFacets());
      dispatch(executeSearch(logClearBreadcrumbs()));
    },
  };
};

/**
 * Represents a generic breadcrumb type.
 */
export interface Breadcrumb<T extends BaseFacetValue> {
  /**
   * The field on which the underlying facet is configured.
   */
  field: string;
  /**
   * The list of facet values currently active and selected.
   */
  values: BreadcrumbValue<T>[];
}

/**
 * Represents a generic breadcrumb value type.
 *
 * Can either be a @type {FacetBreadcrumb}, @type {NumericFacetBreadcrumb}, @type {DateFacetBreadcrumb}, @type {CategoryFacetBreadcrumb}
 */
export type BreadcrumbValue<T extends BaseFacetValue> = {
  /**
   * The underlying facet value linked to this breadcrumb.
   */
  value: T;
  /**
   * Allow to deselect and clear the corresponding facet filter.
   */
  deselect: () => void;
};

/**
 * Represents a breadcrumb for specific facet.
 */
export type FacetBreadcrumb = Breadcrumb<FacetValue>;
/**
 * Represents a breadcrumb for a numerical facet.
 */
export type NumericFacetBreadcrumb = Breadcrumb<NumericFacetValue>;
/**
 * Represents a breadcrumb for a date facet.
 */
export type DateFacetBreadcrumb = Breadcrumb<DateFacetValue>;
/**
 * Represents a breadcrumb for a category facet.
 */
export interface CategoryFacetBreadcrumb {
  /**
   * The field on which the underlying facet is configured.
   */
  field: string;
  /**
   * The complete path of the underlying category facet value.
   */
  path: CategoryFacetValue[];
  /**
   * Allow to deselect and clear the corresponding facet filter.
   */
  deselect: () => void;
}
