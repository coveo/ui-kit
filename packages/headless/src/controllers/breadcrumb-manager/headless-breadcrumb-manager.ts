import {Engine} from '../../app/headless-engine';
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

/**
 * The `BreadcrumbManager` headless controller manages a summary of the currently active facet filters.
 */
export interface BreadcrumbManager extends Controller {
  /**
   * Deselects all facet values.
   */
  deselectAll(): void;

  /**
   * Deselects a facet breadcrumb value or category facet breadcrumb.
   * @param value - The facet breadcrumb value or a category facet breadcrumb to deselect.
   */
  deselectBreadcrumb(
    value: BreadcrumbValue<BaseFacetValue> | CategoryFacetBreadcrumb
  ): void;

  /**
   * The state of the `BreadcrumbManager` controller.
   */
  state: BreadcrumbManagerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `BreadcrumbManager` controller.
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
   * `true` if there are any available breadcrumbs (i.e., if there are any active facet values), and `false` otherwise.
   */
  hasBreadcrumbs: boolean;
}

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
   * The id for the underlying facet.
   */
  facetId: string;
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

/**
 * Represents a generic breadcrumb type.
 *
 * Can either be a `FacetBreadcrumb`, `NumericFacetBreadcrumb`, `DateFacetBreadcrumb`, or `CategoryFacetBreadcrumb`.
 */
export interface Breadcrumb<T extends BaseFacetValue> {
  /**
   * The id for the underlying facet.
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
export interface BreadcrumbValue<T extends BaseFacetValue> {
  /**
   * The underlying facet value linked to this breadcrumb.
   */
  value: T;
  /**
   * Deselects the corresponding facet value.
   */
  deselect: () => void;
}

/**
 * Creates a `BreadcrumbManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `BreadcrumbManager` controller instance.
 */
export function buildBreadcrumbManager(
  engine: Engine<object>
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

  function hasBreadcrumbs() {
    return !![
      ...getFacetBreadcrumbs(),
      ...getNumericFacetBreadcrumbs(),
      ...getDateFacetBreadcrumbs(),
      ...getCategoryFacetBreadcrumbs(),
    ].length;
  }

  return {
    subscribe: controller.subscribe,

    get state() {
      return {
        facetBreadcrumbs: getFacetBreadcrumbs(),
        categoryFacetBreadcrumbs: getCategoryFacetBreadcrumbs(),
        numericFacetBreadcrumbs: getNumericFacetBreadcrumbs(),
        dateFacetBreadcrumbs: getDateFacetBreadcrumbs(),
        hasBreadcrumbs: hasBreadcrumbs(),
      };
    },

    deselectAll: () => {
      dispatch(deselectAllFacets());
      dispatch(executeSearch(logClearBreadcrumbs()));
    },

    deselectBreadcrumb(
      value: BreadcrumbValue<BaseFacetValue> | CategoryFacetBreadcrumb
    ) {
      value.deselect();
    },
  };
}

function loadBreadcrumbManagerReducers(
  engine: Engine<object>
): engine is Engine<
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
