import {configuration} from '../../app/common-reducers.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {SearchPageEvents} from '../../features/analytics/search-action-cause.js';
import {toggleSelectAutomaticFacetValue} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions.js';
import type {AutomaticFacetResponse} from '../../features/facets/automatic-facet-set/interfaces/response.js';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions.js';
import {
  categoryBreadcrumbFacet,
  logCategoryFacetBreadcrumb,
} from '../../features/facets/category-facet-set/category-facet-set-analytics-actions.js';
import {categoryFacetResponseSelectedValuesSelector} from '../../features/facets/category-facet-set/category-facet-set-selectors.js';
import {categoryFacetSetReducer as categoryFacetSet} from '../../features/facets/category-facet-set/category-facet-set-slice.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions.js';
import {
  breadcrumbFacet,
  logFacetBreadcrumb,
} from '../../features/facets/facet-set/facet-set-analytics-actions.js';
import {facetResponseActiveValuesSelector} from '../../features/facets/facet-set/facet-set-selectors.js';
import {facetSetReducer as facetSet} from '../../features/facets/facet-set/facet-set-slice.js';
import type {FacetSlice} from '../../features/facets/facet-set/facet-set-state.js';
import type {FacetValue} from '../../features/facets/facet-set/interfaces/response.js';
import {logClearBreadcrumbs} from '../../features/facets/generic/facet-generic-analytics-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {
  dateBreadcrumbFacet,
  logDateFacetBreadcrumb,
} from '../../features/facets/range-facets/date-facet-set/date-facet-analytics-actions.js';
import {dateFacetActiveValuesSelector} from '../../features/facets/range-facets/date-facet-set/date-facet-selectors.js';
import {dateFacetSetReducer as dateFacetSet} from '../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import type {DateFacetSlice} from '../../features/facets/range-facets/date-facet-set/date-facet-set-state.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {
  logNumericFacetBreadcrumb,
  numericBreadcrumbFacet,
} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions.js';
import {numericFacetActiveValuesSelector} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors.js';
import {numericFacetSetReducer as numericFacetSet} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import type {NumericFacetSlice} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import {
  logStaticFilterDeselect,
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions.js';
import type {
  StaticFilterSlice,
  StaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-state.js';
import type {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  type Breadcrumb,
  type BreadcrumbValue,
  buildCoreBreadcrumbManager,
  type CategoryFacetBreadcrumb,
  type BreadcrumbManager as CoreBreadcrumbManager,
  type BreadcrumbManagerState as CoreBreadcrumbManagerState,
  type DateFacetBreadcrumb,
  type DeselectableValue,
  type FacetBreadcrumb,
  type GetBreadcrumbsConfiguration,
  getBreadcrumbs,
  type NumericFacetBreadcrumb,
  type StaticFilterBreadcrumb,
} from '../core/breadcrumb-manager/headless-core-breadcrumb-manager.js';

export type {
  NumericFacetBreadcrumb,
  FacetBreadcrumb,
  DateFacetBreadcrumb,
  CategoryFacetBreadcrumb,
  StaticFilterBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
  DeselectableValue,
  CoreBreadcrumbManager,
  CoreBreadcrumbManagerState,
};

/**
 * The `BreadcrumbManager` headless controller manages a summary of the currently active facet filters.
 *
 * Example: [breadcrumb-manager.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/breadcrumb-manager/breadcrumb-manager.fn.tsx)
 *
 * @group Controllers
 * @category BreadcrumbManager
 */
export interface BreadcrumbManager extends CoreBreadcrumbManager {
  /**
   * The state of the `BreadcrumbManager` controller.
   */
  state: BreadcrumbManagerState;
}

/**
 * A scoped and simplified part of the headless state that's relevant to the `BreadcrumbManager` controller.
 *
 * @group Controllers
 * @category BreadcrumbManager
 */
export interface BreadcrumbManagerState extends CoreBreadcrumbManagerState {
  /**
   * The list of automatic facet breadcrumbs.
   */
  automaticFacetBreadcrumbs: AutomaticFacetBreadcrumb[];
}

/**
 * Represents a breadcrumb for an automatic facet.
 */
export interface AutomaticFacetBreadcrumb extends Breadcrumb<FacetValue> {
  /**
   * The label of the underlying facet.
   */
  label: string;
}

/**
 * Creates a `BreadcrumbManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `BreadcrumbManager` controller instance.
 *
 * @group Controllers
 * @category BreadcrumbManager
 */
export function buildBreadcrumbManager(
  engine: SearchEngine
): BreadcrumbManager {
  if (!loadBreadcrumbManagerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildCoreBreadcrumbManager(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const getFacetBreadcrumbs = (): FacetBreadcrumb[] => {
    const config: GetBreadcrumbsConfiguration<Record<string, FacetSlice>> = {
      engine,
      facetSet: getState().facetSet,
      executeToggleSelect: ({facetId, selection}) => {
        dispatch(toggleSelectFacetValue({facetId, selection}));
        dispatch(
          updateFreezeCurrentValues({facetId, freezeCurrentValues: false})
        );
        dispatch(
          executeSearch({
            legacy: logFacetBreadcrumb({
              facetId: facetId,
              facetValue: selection.value,
            }),
            next: breadcrumbFacet(),
          })
        );
      },
      executeToggleExclude: ({facetId, selection}) => {
        dispatch(toggleExcludeFacetValue({facetId, selection}));
        dispatch(
          updateFreezeCurrentValues({facetId, freezeCurrentValues: false})
        );
        dispatch(
          executeSearch({
            legacy: logFacetBreadcrumb({
              facetId: facetId,
              facetValue: selection.value,
            }),
            next: breadcrumbFacet(),
          })
        );
      },
      facetValuesSelector: facetResponseActiveValuesSelector,
    };

    return getBreadcrumbs(config);
  };

  const getNumericFacetBreadcrumbs = (): NumericFacetBreadcrumb[] => {
    const config: GetBreadcrumbsConfiguration<
      Record<string, NumericFacetSlice>
    > = {
      engine,
      facetSet: getState().numericFacetSet,
      executeToggleSelect: (payload) => {
        dispatch(toggleSelectNumericFacetValue(payload));
        dispatch(
          executeSearch({
            legacy: logNumericFacetBreadcrumb(payload),
            next: numericBreadcrumbFacet(),
          })
        );
      },
      executeToggleExclude: (payload) => {
        dispatch(toggleExcludeNumericFacetValue(payload));
        dispatch(
          executeSearch({
            legacy: logNumericFacetBreadcrumb(payload),
            next: numericBreadcrumbFacet(),
          })
        );
      },
      facetValuesSelector: numericFacetActiveValuesSelector,
    };
    return getBreadcrumbs(config);
  };

  const getDateFacetBreadcrumbs = (): DateFacetBreadcrumb[] => {
    const config: GetBreadcrumbsConfiguration<Record<string, DateFacetSlice>> =
      {
        engine,
        facetSet: getState().dateFacetSet,
        executeToggleSelect: (payload) => {
          dispatch(toggleSelectDateFacetValue(payload));
          dispatch(
            executeSearch({
              legacy: logDateFacetBreadcrumb(payload),
              next: dateBreadcrumbFacet(),
            })
          );
        },
        executeToggleExclude: (payload) => {
          dispatch(toggleExcludeDateFacetValue(payload));
          dispatch(
            executeSearch({
              legacy: logDateFacetBreadcrumb(payload),
              next: dateBreadcrumbFacet(),
            })
          );
        },
        facetValuesSelector: dateFacetActiveValuesSelector,
      };

    return getBreadcrumbs(config);
  };

  const getCategoryFacetBreadcrumbs = (): CategoryFacetBreadcrumb[] => {
    return Object.keys(getState().categoryFacetSet)
      .map(buildCategoryFacetBreadcrumb)
      .filter((breadcrumb) => breadcrumb.path.length);
  };

  const buildCategoryFacetBreadcrumb = (facetId: string) => {
    const path = categoryFacetResponseSelectedValuesSelector(
      getState(),
      facetId
    );
    return {
      facetId,
      field: getState().categoryFacetSet[facetId]!.request.field,
      path,
      deselect: () => {
        dispatch(deselectAllCategoryFacetValues(facetId));
        dispatch(
          executeSearch({
            legacy: logCategoryFacetBreadcrumb({
              categoryFacetPath: path.map(
                (categoryFacetValue) => categoryFacetValue.value
              ),
              categoryFacetId: facetId,
            }),
            next: categoryBreadcrumbFacet(),
          })
        );
      },
    };
  };

  const getStaticFilterBreadcrumbs = (): StaticFilterBreadcrumb[] => {
    const set = getState().staticFilterSet ?? {};
    return Object.values(set).map(buildStaticFilterBreadcrumb);
  };

  const buildStaticFilterBreadcrumb = (
    filter: StaticFilterSlice
  ): StaticFilterBreadcrumb => {
    const {id, values: filterValues} = filter;
    const values = filterValues
      .filter((value) => value.state !== 'idle')
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
        const {caption, expression} = value;

        if (value.state === 'selected') {
          dispatch(toggleSelectStaticFilterValue({id, value}));
        } else if (value.state === 'excluded') {
          dispatch(toggleExcludeStaticFilterValue({id, value}));
        }
        dispatch(
          executeSearch({
            legacy: logStaticFilterDeselect({
              staticFilterId: id,
              staticFilterValue: {caption, expression},
            }),
          })
        );
      },
    };
  };

  const getAutomaticFacetBreadcrumbs = (): AutomaticFacetBreadcrumb[] => {
    const set = getState().automaticFacetSet?.set ?? {};
    return Object.values(set)
      .map((slice) => buildAutomaticFacetBreadcrumb(slice.response))
      .filter((breadcrumb) => breadcrumb.values.length > 0);
  };

  const buildAutomaticFacetBreadcrumb = (
    response: AutomaticFacetResponse
  ): AutomaticFacetBreadcrumb => {
    const {field, label} = response;
    const values = response.values
      .filter((value) => value.state !== 'idle')
      .map((value) => buildAutomaticFacetBreadcrumbValue(field, value));
    return {
      facetId: field,
      field,
      label,
      values,
    };
  };

  const buildAutomaticFacetBreadcrumbValue = (
    field: string,
    selection: FacetValue
  ) => {
    return {
      value: selection,
      deselect: () => {
        dispatch(
          toggleSelectAutomaticFacetValue({
            field,
            selection,
          })
        );
        dispatch(
          executeSearch({
            legacy: logFacetBreadcrumb({
              facetId: field,
              facetValue: selection.value,
            }),
            next: breadcrumbFacet(),
          })
        );
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
      ...getAutomaticFacetBreadcrumbs(),
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
        automaticFacetBreadcrumbs: getAutomaticFacetBreadcrumbs(),
        hasBreadcrumbs: hasBreadcrumbs(),
      };
    },

    deselectAll: () => {
      controller.deselectAll();
      dispatch(
        executeSearch({
          legacy: logClearBreadcrumbs(),
          next: {actionCause: SearchPageEvents.breadcrumbResetAll},
        })
      );
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
