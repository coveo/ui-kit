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
import {selectFacetBreadcrumb} from '../../features/facets/facet-set/facet-set-actions';
import {executeRangeFacetBreadcrumb} from '../../features/facets/range-facets/generic/range-facet-controller-actions';
import {toggleSelectNumericFacetValue} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {toggleSelectDateFacetValue} from '../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  deselectAllCategoryFacetValues,
  updateCategoryFacetNumberOfValues,
} from '../../features/facets/category-facet-set/category-facet-set-actions';
import {logCategoryFacetBreadcrumb} from '../../features/facets/category-facet-set/category-facet-set-analytics-actions';

export type BreadcrumbManager = ReturnType<typeof buildBreadcrumbManager>;
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
        dispatch(selectFacetBreadcrumb({facetId, selection}));
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
        dispatch(executeRangeFacetBreadcrumb(payload));
      },
      numericFacetSelectedValuesSelector
    );
  }

  function getDateFacetBreadcrumbs(): DateFacetBreadcrumb[] {
    return getBreadcrumbs<DateFacetValue>(
      engine.state.dateFacetSet,
      (payload) => {
        dispatch(toggleSelectDateFacetValue(payload));
        dispatch(executeRangeFacetBreadcrumb(payload));
      },
      dateFacetSelectedValuesSelector
    );
  }

  function buildCategoryFacetBreadcrumb(facetId: string) {
    const path = categoryFacetSelectedValuesSelector(engine.state, facetId);
    return {
      field: engine.state.categoryFacetSet[facetId].field,
      path,
      deselect: () => {
        dispatch(deselectAllCategoryFacetValues(facetId));
        dispatch(
          updateCategoryFacetNumberOfValues({facetId, numberOfValues: 5})
        );
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

    get state() {
      return {
        facetBreadcrumbs: getFacetBreadcrumbs(),
        categoryFacetBreadcrumbs: getCategoryFacetBreadcrumbs(),
        numericFacetBreadcrumbs: getNumericFacetBreadcrumbs(),
        dateFacetBreadcrumbs: getDateFacetBreadcrumbs(),
      };
    },
    hasBreadcrumbs,
    deselectAll: () => {
      dispatch(deselectAllFacets());
      dispatch(executeSearch(logClearBreadcrumbs()));
    },
  };
};

export interface Breadcrumb<T extends BaseFacetValue> {
  field: string;
  values: BreadcrumbValue<T>[];
}

export type BreadcrumbValue<T extends BaseFacetValue> = {
  value: T;
  deselect: () => void;
};

export type FacetBreadcrumb = Breadcrumb<FacetValue>;
export type NumericFacetBreadcrumb = Breadcrumb<NumericFacetValue>;
export type DateFacetBreadcrumb = Breadcrumb<DateFacetValue>;
export interface CategoryFacetBreadcrumb {
  field: string;
  path: CategoryFacetValue[];
  deselect: () => void;
}

export type BreadcrumbField = Pick<
  | FacetBreadcrumb
  | NumericFacetBreadcrumb
  | DateFacetBreadcrumb
  | CategoryFacetBreadcrumb,
  'field'
>;
