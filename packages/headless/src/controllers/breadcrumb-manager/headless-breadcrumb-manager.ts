import {configuration} from '../../app/common-reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {toggleSelectAutomaticFacetValue} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {AutomaticFacetResponse} from '../../features/facets/automatic-facet-set/interfaces/response';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions';
import {logCategoryFacetBreadcrumb} from '../../features/facets/category-facet-set/category-facet-set-analytics-actions';
import {categoryFacetResponseSelectedValuesSelector} from '../../features/facets/category-facet-set/category-facet-set-selectors';
import {categoryFacetSetReducer as categoryFacetSet} from '../../features/facets/category-facet-set/category-facet-set-slice';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions';
import {logFacetBreadcrumb} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {facetResponseActiveValuesSelector} from '../../features/facets/facet-set/facet-set-selectors';
import {facetSetReducer as facetSet} from '../../features/facets/facet-set/facet-set-slice';
import {FacetValue} from '../../features/facets/facet-set/interfaces/response';
import {FacetSlice} from '../../features/facets/facet-set/facet-set-state';
import {logClearBreadcrumbs} from '../../features/facets/generic/facet-generic-analytics-actions';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {logDateFacetBreadcrumb} from '../../features/facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {dateFacetActiveValuesSelector} from '../../features/facets/range-facets/date-facet-set/date-facet-selectors';
import {dateFacetSetReducer as dateFacetSet} from '../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetSlice} from '../../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {logNumericFacetBreadcrumb} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {numericFacetActiveValuesSelector} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors';
import {numericFacetSetReducer as numericFacetSet} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {NumericFacetSlice} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {executeSearch} from '../../features/search/search-actions';
import {searchReducer as search} from '../../features/search/search-slice';
import {
  logStaticFilterDeselect,
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions';
import {
  StaticFilterSlice,
  StaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-state';
import {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {
  Breadcrumb,
  BreadcrumbManager as CoreBreadcrumbManager,
  BreadcrumbManagerState as CoreBreadcrumbManagerState,
  BreadcrumbValue,
  buildCoreBreadcrumbManager,
  CategoryFacetBreadcrumb,
  DateFacetBreadcrumb,
  DeselectableValue,
  FacetBreadcrumb,
  getBreadcrumbs,
  GetBreadcrumbsConfiguration,
  NumericFacetBreadcrumb,
  StaticFilterBreadcrumb,
} from '../core/breadcrumb-manager/headless-core-breadcrumb-manager';

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
 */
export interface BreadcrumbManager extends CoreBreadcrumbManager {
  /**
   * The state of the `BreadcrumbManager` controller.
   */
  state: BreadcrumbManagerState;
}
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
      executeToggleExclude: ({facetId, selection}) => {
        const analyticsAction = logFacetBreadcrumb({
          facetId: facetId,
          facetValue: selection.value,
        });
        dispatch(toggleExcludeFacetValue({facetId, selection}));
        dispatch(
          updateFreezeCurrentValues({facetId, freezeCurrentValues: false})
        );
        dispatch(executeSearch(analyticsAction));
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
        dispatch(executeSearch(logNumericFacetBreadcrumb(payload)));
      },
      executeToggleExclude: (payload) => {
        dispatch(toggleExcludeNumericFacetValue(payload));
        dispatch(executeSearch(logNumericFacetBreadcrumb(payload)));
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
          dispatch(executeSearch(logDateFacetBreadcrumb(payload)));
        },
        executeToggleExclude: (payload) => {
          dispatch(toggleExcludeDateFacetValue(payload));
          dispatch(executeSearch(logDateFacetBreadcrumb(payload)));
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
        const analytics = logStaticFilterDeselect({
          staticFilterId: id,
          staticFilterValue: {caption, expression},
        });

        if (value.state === 'selected') {
          dispatch(toggleSelectStaticFilterValue({id, value}));
        } else if (value.state === 'excluded') {
          dispatch(toggleExcludeStaticFilterValue({id, value}));
        }
        dispatch(executeSearch(analytics));
      },
    };
  };

  const getAutomaticFacetBreadcrumbs = (): AutomaticFacetBreadcrumb[] => {
    const set = getState().automaticFacetSet?.set ?? {};
    return Object.values(set).map((slice) =>
      buildAutomaticFacetBreadcrumb(slice.response)
    );
  };

  const buildAutomaticFacetBreadcrumb = (
    response: AutomaticFacetResponse
  ): AutomaticFacetBreadcrumb => {
    const {field, label} = response;
    const values = response.values
      .filter((value) => value.state === 'selected')
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
        const analyticsAction = logFacetBreadcrumb({
          facetId: field,
          facetValue: selection.value,
        });
        dispatch(
          toggleSelectAutomaticFacetValue({
            field,
            selection,
          })
        );
        dispatch(executeSearch(analyticsAction));
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
      dispatch(executeSearch(logClearBreadcrumbs()));
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
