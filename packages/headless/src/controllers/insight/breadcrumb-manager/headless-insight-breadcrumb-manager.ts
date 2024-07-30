import {configuration} from '../../../app/common-reducers';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {deselectAllCategoryFacetValues} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryBreadcrumbFacet} from '../../../features/facets/category-facet-set/category-facet-set-analytics-actions';
import {logCategoryFacetBreadcrumb} from '../../../features/facets/category-facet-set/category-facet-set-insight-analytics-actions';
import {categoryFacetResponseSelectedValuesSelector} from '../../../features/facets/category-facet-set/category-facet-set-selectors';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../../features/facets/facet-set/facet-set-actions';
import {breadcrumbFacet} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {logFacetBreadcrumb} from '../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {facetResponseActiveValuesSelector} from '../../../features/facets/facet-set/facet-set-selectors';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {FacetSlice} from '../../../features/facets/facet-set/facet-set-state';
import {logClearBreadcrumbs} from '../../../features/facets/generic/facet-generic-insight-analytics-actions';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {dateBreadcrumbFacet} from '../../../features/facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {logDateFacetBreadcrumb} from '../../../features/facets/range-facets/date-facet-set/date-facet-insight-analytics-actions';
import {dateFacetActiveValuesSelector} from '../../../features/facets/range-facets/date-facet-set/date-facet-selectors';
import {dateFacetSetReducer as dateFacetSet} from '../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {DateFacetSlice} from '../../../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {numericBreadcrumbFacet} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {logNumericFacetBreadcrumb} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-insight-analytics-actions';
import {numericFacetActiveValuesSelector} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors';
import {numericFacetSetReducer as numericFacetSet} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {NumericFacetSlice} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {searchReducer as search} from '../../../features/search/search-slice';
import {
  staticFilterDeselect,
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from '../../../features/static-filter-set/static-filter-set-actions';
import {logInsightStaticFilterDeselect} from '../../../features/static-filter-set/static-filter-set-insight-analytics-actions';
import {
  StaticFilterSlice,
  StaticFilterValue,
} from '../../../features/static-filter-set/static-filter-set-state';
import {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  Breadcrumb,
  BreadcrumbManager,
  BreadcrumbManagerState,
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
} from '../../core/breadcrumb-manager/headless-core-breadcrumb-manager';

export type {
  NumericFacetBreadcrumb,
  FacetBreadcrumb,
  DateFacetBreadcrumb,
  CategoryFacetBreadcrumb,
  StaticFilterBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
  BreadcrumbManagerState,
  BreadcrumbManager,
  DeselectableValue,
};
/**
 * Creates an insight `BreadcrumbManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `BreadcrumbManager` controller instance.
 */
export function buildBreadcrumbManager(
  engine: InsightEngine
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
        dispatch(
          executeSearch({legacy: analyticsAction, next: breadcrumbFacet()})
        );
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
        dispatch(
          executeSearch({legacy: analyticsAction, next: breadcrumbFacet()})
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

  const getCategoryFacetBreadcrumbs = (): CategoryFacetBreadcrumb[] => {
    return Object.keys(getState().categoryFacetSet)
      .map(buildCategoryFacetBreadcrumb)
      .filter((breadcrumb) => breadcrumb.path.length);
  };

  const getStaticFilterBreadcrumbs = (): StaticFilterBreadcrumb[] => {
    const set = getState().staticFilterSet || {};
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
        const analytics = logInsightStaticFilterDeselect({
          staticFilterId: id,
          staticFilterValue: {caption, expression},
        });

        if (value.state === 'selected') {
          dispatch(toggleSelectStaticFilterValue({id, value}));
        } else if (value.state === 'excluded') {
          dispatch(toggleExcludeStaticFilterValue({id, value}));
        }
        dispatch(
          executeSearch({legacy: analytics, next: staticFilterDeselect()})
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
      controller.deselectAll();
      dispatch(
        executeSearch({
          legacy: logClearBreadcrumbs(),
        })
      );
    },
  };
}

function loadBreadcrumbManagerReducers(
  engine: InsightEngine
): engine is InsightEngine<
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
