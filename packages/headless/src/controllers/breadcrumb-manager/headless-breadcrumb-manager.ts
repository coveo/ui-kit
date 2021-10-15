import {buildController, Controller} from '../controller/headless-controller';
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
import {
  configuration,
  search,
  facetSet,
  numericFacetSet,
  dateFacetSet,
  categoryFacetSet,
} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {StaticFilterValue} from '..';
import {StaticFilterSlice} from '../../features/static-filter-set/static-filter-set-state';
import {
  deselectAllStaticFilters,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions';
import {noopSearchAnalyticsAction} from '../../features/analytics/analytics-utils';

/**
 * The `BreadcrumbManager` headless controller manages a summary of the currently active facet filters.
 */
export interface BreadcrumbManager extends Controller {
  /**
   * Deselects all facet values.
   */
  deselectAll(): void;

  /**
   * Deselects a the breadcrumb value.
   * @param value - The breadcrumb value to deselect.
   */
  deselectBreadcrumb(value: DeselectableValue): void;

  /**
   * The state of the `BreadcrumbManager` controller.
   */
  state: BreadcrumbManagerState;
}

/**
 * A scoped and simplified part of the headless state that's relevant to the `BreadcrumbManager` controller.
 */
export interface BreadcrumbManagerState {
  /**
   * The list of specific facet breadcrumbs.
   */
  facetBreadcrumbs: FacetBreadcrumb[];

  /**
   * The list of category facet breadcrumbs.
   */
  categoryFacetBreadcrumbs: CategoryFacetBreadcrumb[];

  /**
   * The list of numeric facet breadcrumbs.
   */
  numericFacetBreadcrumbs: NumericFacetBreadcrumb[];

  /**
   * The list of date facet breadcrumbs.
   */
  dateFacetBreadcrumbs: DateFacetBreadcrumb[];

  /**
   * The list of static filter breadcrumbs.
   */
  staticFilterBreadcrumbs: StaticFilterBreadcrumb[];

  /**
   * Returns `true` if there are any available breadcrumbs (i.e., if there are any active facet values), and `false` if not.
   */
  hasBreadcrumbs: boolean;
}

/**
 * Represents a breadcrumb for a specific facet.
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
export interface CategoryFacetBreadcrumb extends DeselectableValue {
  /**
   * The ID of the underlying facet.
   */
  facetId: string;
  /**
   * The field on which the underlying facet is configured.
   */
  field: string;
  /**
   * The complete path to the underlying facet value.
   */
  path: CategoryFacetValue[];
}

/**
 * Represents a breadcrumb for a static filter.
 */
export interface StaticFilterBreadcrumb {
  /**
   * The ID of the underlying static filter.
   */
  id: string;

  /**
   * The list of static filter values currently selected.
   */
  values: StaticFilterBreadcrumbValue[];
}

/**
 * Represents a static filter breadcrumb value.
 */
export interface StaticFilterBreadcrumbValue extends DeselectableValue {
  /**
   * The underlying static filter value linked to this breadcrumb.
   */
  value: StaticFilterValue;
}

/**
 * Represents a generic breadcrumb type.
 *
 * This can be a `FacetBreadcrumb`, `NumericFacetBreadcrumb`, `DateFacetBreadcrumb`, or `CategoryFacetBreadcrumb`.
 */
export interface Breadcrumb<T extends BaseFacetValue> {
  /**
   * The ID of the underlying facet.
   */
  facetId: string;
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
export interface BreadcrumbValue<T extends BaseFacetValue>
  extends DeselectableValue {
  /**
   * The underlying facet value linked to this breadcrumb.
   */
  value: T;
}

export interface DeselectableValue {
  /**
   * A function that when called dispatches actions to deselect a breadcrumb value.
   */
  deselect(): void;
}

/**
 * Creates a `BreadcrumbManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `BreadcrumbManager` controller instance.
 */
export function buildBreadcrumbManager(
  engine: SearchEngine
): BreadcrumbManager {
  if (!loadBreadcrumbManagerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getBreadcrumbs = <T extends BaseFacetValue>(
    facetSet: Record<string, BaseFacetRequest>,
    executeToggleSelect: (payload: {facetId: string; selection: T}) => void,
    facetValuesSelector:
      | ((state: SearchSection & FacetSection, facetId: string) => T[])
      | ((state: SearchSection & NumericFacetSection, facetId: string) => T[])
      | ((state: SearchSection & DateFacetSection, facetId: string) => T[])
  ) => {
    return Object.keys(facetSet)
      .map((facetId) => {
        const values = facetValuesSelector(engine.state, facetId).map(
          (selection) => ({
            value: selection,
            deselect: () => executeToggleSelect({facetId, selection}),
          })
        );

        return {
          facetId,
          field: facetSet[facetId].field,
          values,
        };
      })
      .filter((breadcrumb) => breadcrumb.values.length);
  };

  const getFacetBreadcrumbs = (): FacetBreadcrumb[] => {
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
  };

  const getNumericFacetBreadcrumbs = (): NumericFacetBreadcrumb[] => {
    return getBreadcrumbs<NumericFacetValue>(
      engine.state.numericFacetSet,
      (payload) => {
        dispatch(toggleSelectNumericFacetValue(payload));
        dispatch(executeSearch(logNumericFacetBreadcrumb(payload)));
      },
      numericFacetSelectedValuesSelector
    );
  };

  const getDateFacetBreadcrumbs = (): DateFacetBreadcrumb[] => {
    return getBreadcrumbs<DateFacetValue>(
      engine.state.dateFacetSet,
      (payload) => {
        dispatch(toggleSelectDateFacetValue(payload));
        dispatch(executeSearch(logDateFacetBreadcrumb(payload)));
      },
      dateFacetSelectedValuesSelector
    );
  };

  const buildCategoryFacetBreadcrumb = (facetId: string) => {
    const path = categoryFacetSelectedValuesSelector(engine.state, facetId);
    return {
      facetId,
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
  };

  const getCategoryFacetBreadcrumbs = (): CategoryFacetBreadcrumb[] => {
    return Object.keys(engine.state.categoryFacetSet)
      .map(buildCategoryFacetBreadcrumb)
      .filter((breadcrumb) => breadcrumb.path.length);
  };

  const getStaticFilterBreadcrumbs = (): StaticFilterBreadcrumb[] => {
    const set = engine.state.staticFilterSet || {};
    return Object.values(set).map(buildStaticFilterBreadcrumb);
  };

  const buildStaticFilterBreadcrumb = (
    filter: StaticFilterSlice
  ): StaticFilterBreadcrumb => {
    const {id, values: filterValues} = filter;
    const values = filterValues
      .filter((value) => value.state === 'selected')
      .map((value) => buildStaticFilterBreadcrumbValue(id, value));

    return {id, values};
  };

  const buildStaticFilterBreadcrumbValue = (
    id: string,
    value: StaticFilterValue
  ) => {
    return {
      value,
      deselect: () => {
        dispatch(toggleSelectStaticFilterValue({id, value}));
        dispatch(executeSearch(noopSearchAnalyticsAction()));
      },
    };
  };

  function hasBreadcrumbs() {
    return !![
      ...getFacetBreadcrumbs(),
      ...getNumericFacetBreadcrumbs(),
      ...getDateFacetBreadcrumbs(),
      ...getCategoryFacetBreadcrumbs(),
      ...getStaticFilterBreadcrumbs(),
    ].length;
  }

  return {
    ...controller,

    get state() {
      return {
        facetBreadcrumbs: getFacetBreadcrumbs(),
        categoryFacetBreadcrumbs: getCategoryFacetBreadcrumbs(),
        numericFacetBreadcrumbs: getNumericFacetBreadcrumbs(),
        dateFacetBreadcrumbs: getDateFacetBreadcrumbs(),
        staticFilterBreadcrumbs: getStaticFilterBreadcrumbs(),
        hasBreadcrumbs: hasBreadcrumbs(),
      };
    },

    deselectAll: () => {
      dispatch(deselectAllFacets());
      dispatch(deselectAllStaticFilters());
      dispatch(executeSearch(logClearBreadcrumbs()));
    },

    deselectBreadcrumb(value: DeselectableValue) {
      value.deselect();
    },
  };
}

function loadBreadcrumbManagerReducers(
  engine: SearchEngine
): engine is SearchEngine<
  ConfigurationSection &
    SearchSection &
    FacetSection &
    NumericFacetSection &
    DateFacetSection &
    CategoryFacetSection
> {
  engine.addReducers({
    configuration,
    search,
    facetSet,
    numericFacetSet,
    dateFacetSet,
    categoryFacetSet,
  });

  return true;
}
