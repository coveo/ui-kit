import {SearchEngine} from '../../app/search-engine/search-engine';
import {deselectAllCategoryFacetValues} from '../../features/facets/category-facet-set/category-facet-set-actions';
import {logCategoryFacetBreadcrumb} from '../../features/facets/category-facet-set/category-facet-set-analytics-actions';
import {categoryFacetSelectedValuesSelector} from '../../features/facets/category-facet-set/category-facet-set-selectors';
import {BaseFacetRequest} from '../../features/facets/facet-api/request';
import {BaseFacetValue} from '../../features/facets/facet-api/response';
import {
  toggleSelectFacetValue,
  updateFreezeCurrentValues,
} from '../../features/facets/facet-set/facet-set-actions';
import {logFacetBreadcrumb} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {facetResponseSelectedValuesSelector} from '../../features/facets/facet-set/facet-set-selectors';
import {FacetValue} from '../../features/facets/facet-set/interfaces/response';
import {logClearBreadcrumbs} from '../../features/facets/generic/facet-generic-analytics-actions';
import {toggleSelectDateFacetValue} from '../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {logDateFacetBreadcrumb} from '../../features/facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {dateFacetSelectedValuesSelector} from '../../features/facets/range-facets/date-facet-set/date-facet-selectors';
import {DateFacetValue} from '../../features/facets/range-facets/date-facet-set/interfaces/response';
import {NumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {toggleSelectNumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {logNumericFacetBreadcrumb} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {numericFacetSelectedValuesSelector} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors';
import {executeSearch} from '../../features/search/search-actions';
import {
  logStaticFilterDeselect,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions';
import {
  StaticFilterSlice,
  StaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-state';
import {
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../state/state-sections';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
  CategoryFacetBreadcrumb,
  DateFacetBreadcrumb,
  FacetBreadcrumb,
  NumericFacetBreadcrumb,
  StaticFilterBreadcrumb,
} from '../core/breadcrumb-manager/headless-core-breadcrumb-manager';

/**
 * Creates a `BreadcrumbManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `BreadcrumbManager` controller instance.
 */
export function buildBreadcrumbManager(
  engine: SearchEngine
): BreadcrumbManager {
  const controller = buildCoreBreadcrumbManager(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

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
        const values = facetValuesSelector(getState(), facetId).map(
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
    const path = categoryFacetSelectedValuesSelector(getState(), facetId);
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
        const {caption, expression} = value;
        const analytics = logStaticFilterDeselect({
          staticFilterId: id,
          staticFilterValue: {caption, expression},
        });

        dispatch(toggleSelectStaticFilterValue({id, value}));
        dispatch(executeSearch(analytics));
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
      dispatch(executeSearch(logClearBreadcrumbs()));
    },
  };
}
