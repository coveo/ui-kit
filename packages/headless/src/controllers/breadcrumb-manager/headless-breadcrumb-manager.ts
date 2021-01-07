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
import {executeSearch} from '../../features/search/search-actions';
import {deselectAllFacets} from '../../features/facets/generic/facet-actions';
import {logClearBreadcrumbs} from '../../features/facets/generic/facet-generic-analytics-actions';
import {logFacetBreadcrumb} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions';
import {toggleSelectNumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {toggleSelectDateFacetValue} from '../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions';
import {logCategoryFacetBreadcrumb} from '../../features/facets/category-facet-set/category-facet-set-analytics-actions';
import {logNumericFacetBreadcrumb} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {logDateFacetBreadcrumb} from '../../features/facets/range-facets/date-facet-set/date-facet-analytics-actions';

/**
 * The `BreadcrumbManager` headless controller manages a summary of the currently active facet filters.
 */
export type BreadcrumbManager = ReturnType<typeof buildBreadcrumbManager>;

/**
 * A scoped and simplified part of the headless state that is relevant to the `BreadcrumbManager` controller.
 */
export type BreadcrumbManagerState = BreadcrumbManager['state'];

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
    executeToggleSelect: (payload: {facetId: string; selection: T}) => void,
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
            deselect: () => executeToggleSelect({facetId, selection}),
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
      ({facetId, selection}) => {
        const analyticsAction = logFacetBreadcrumb({
          facetId: facetId,
          facetValue: selection.value,
        });
        dispatch(toggleSelectFacetValue({facetId, selection}));
        dispatch(
          updateFreezeCurrentValues({facetId, freezeCurrentValues: false})
        );
        dispatch(executeSearch(analyticsAction));
      },
      facetResponseSelectedValuesSelector
    );
  }

  function getNumericFacetBreadcrumbs(): NumericFacetBreadcrumb[] {
    return getBreadcrumbs<NumericFacetValue>(
      engine.state.numericFacetSet,
      (payload) => {
        dispatch(toggleSelectNumericFacetValue(payload));
        dispatch(executeSearch(logNumericFacetBreadcrumb(payload)));
      },
      numericFacetSelectedValuesSelector
    );
  }

  function getDateFacetBreadcrumbs(): DateFacetBreadcrumb[] {
    return getBreadcrumbs<DateFacetValue>(
      engine.state.dateFacetSet,
      (payload) => {
        dispatch(toggleSelectDateFacetValue(payload));
        dispatch(executeSearch(logDateFacetBreadcrumb(payload)));
      },
      dateFacetSelectedValuesSelector
    );
  }

  function buildCategoryFacetBreadcrumb(facetId: string) {
    const path = categoryFacetSelectedValuesSelector(engine.state, facetId);
    return {
      field: engine.state.categoryFacetSet[facetId]!.request.field,
      path,
      deselect: () => {
        dispatch(deselectAllCategoryFacetValues(facetId));
        dispatch(
          executeSearch(
            logCategoryFacetBreadcrumb({
              categoryFacetPath: path.map(
                (categoryFacetValue) => categoryFacetValue.value
              ),
              categoryFacetId: facetId,
            })
          )
        );
      },
    };
  }

  function getCategoryFacetBreadcrumbs(): CategoryFacetBreadcrumb[] {
    return Object.keys(engine.state.categoryFacetSet)
      .map(buildCategoryFacetBreadcrumb)
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
     * The state of the `BreadcrumbManager` controller.
     */
    get state() {
      return {
        /**
         * The list of specific facet breadcrumbs.
         */
        facetBreadcrumbs: getFacetBreadcrumbs(),
        /**
         * The list of category facet breadcrumbs.
         */
        categoryFacetBreadcrumbs: getCategoryFacetBreadcrumbs(),
        /**
         * The list of numeric facet breadcrumbs.
         */
        numericFacetBreadcrumbs: getNumericFacetBreadcrumbs(),
        /**
         * The list of date facet breadcrumbs.
         */
        dateFacetBreadcrumbs: getDateFacetBreadcrumbs(),
        /**
         * `true` if there are any available breadcrumbs (i.e., if there are any active facet values), and `false` otherwise.
         */
        hasBreadcrumbs: hasBreadcrumbs(),
      };
    },
    /**
     * Deselects all facet values.
     */
    deselectAll: () => {
      dispatch(deselectAllFacets());
      dispatch(executeSearch(logClearBreadcrumbs()));
    },

    /**
     * Deselects the provided value
     * @param value a Breadcrumb Value or a Category Facet Breadcrumb
     */
    deselectBreadcrumb(
      value: BreadcrumbValue<BaseFacetValue> | CategoryFacetBreadcrumb
    ) {
      value.deselect();
    },
  };
};

/**
 * Represents a generic breadcrumb type.
 *
 * Can either be a `FacetBreadcrumb`, `NumericFacetBreadcrumb`, `DateFacetBreadcrumb`, or `CategoryFacetBreadcrumb`.
 */
export interface Breadcrumb<T extends BaseFacetValue> {
  /**
   * The field on which the underlying facet is configured.
   */
  field: string;
  /**
   * The list of facet values currently selected.
   */
  values: BreadcrumbValue<T>[];
}

/**
 * Represents a generic breadcrumb value type.
 */
export type BreadcrumbValue<T extends BaseFacetValue> = {
  /**
   * The underlying facet value linked to this breadcrumb.
   */
  value: T;
  /**
   * Deselects the corresponding facet value.
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
   * Deselects the corresponding facet value.
   */
  deselect: () => void;
}
