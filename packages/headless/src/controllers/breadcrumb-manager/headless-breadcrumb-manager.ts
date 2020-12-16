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
import {executeSelectCategoryFacetBreadcrumb} from '../../features/facets/category-facet-set/category-facet-set-controller-actions';
import {executeSelectFacetBreadcrumb} from '../../features/facets/facet-set/facet-set-controller-actions';
import {executeSelectNumericFacetBreadcrumb} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions';
import {executeSelectDateFacetBreadcrumb} from '../../features/facets/range-facets/date-facet-set/date-facet-controller-actions';
import {executeSearch} from '../../features/search/search-actions';
import {deselectAllFacets} from '../../features/facets/generic/facet-actions';
import {logClearBreadcrumbs} from '../../features/facets/generic/facet-generic-analytics-actions';

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
      executeSelectFacetBreadcrumb,
      facetResponseSelectedValuesSelector
    );
  }

  function getNumericFacetBreadcrumbs(): NumericFacetBreadcrumb[] {
    return getBreadcrumbs<NumericFacetValue>(
      engine.state.numericFacetSet,
      executeSelectNumericFacetBreadcrumb,
      numericFacetSelectedValuesSelector
    );
  }

  function getDateFacetBreadcrumbs(): DateFacetBreadcrumb[] {
    return getBreadcrumbs<DateFacetValue>(
      engine.state.dateFacetSet,
      executeSelectDateFacetBreadcrumb,
      dateFacetSelectedValuesSelector
    );
  }

  function getCategoryFacetBreadcrumbs(): CategoryFacetBreadcrumb[] {
    return Object.keys(engine.state.categoryFacetSet)
      .map((facetId) => {
        const path = categoryFacetSelectedValuesSelector(engine.state, facetId);
        return {
          field: engine.state.categoryFacetSet[facetId].field,
          path,
          deselect: () => {
            dispatch(
              executeSelectCategoryFacetBreadcrumb({
                facetId,
                numberOfValues: 5,
                path: path.map(
                  (categoryFacetValue) => categoryFacetValue.value
                ),
              })
            );
          },
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
