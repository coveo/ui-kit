import {CoreEngine} from '../../../app/engine';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions';
import {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response';
import {BaseFacetRequest} from '../../../features/facets/facet-api/request';
import {BaseFacetValue} from '../../../features/facets/facet-api/response';
import {FacetValue} from '../../../features/facets/facet-set/interfaces/response';
import {DateFacetValue} from '../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {NumericFacetValue} from '../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../../state/state-sections';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {StaticFilterValue} from '../../static-filter/headless-static-filter';

/**
 * The `BreadcrumbManager` headless controller manages a summary of the currently active facet filters.
 */
export interface BreadcrumbManager extends Controller {
  /**
   * Deselects all facet values.
   */
  deselectAll(): void;

  /**
   * Deselects a breadcrumb value.
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
type StaticFilterBreadcrumbValue = BreadcrumbValue<StaticFilterValue>;

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
export interface BreadcrumbValue<T> extends DeselectableValue {
  /**
   * The underlying value linked to this breadcrumb.
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
 * @internal
 * Get the breadcrumb of the facet selected
 * @param engine headless engine
 * @param facetSet facet section
 * @param executeToggleSelect the execute toggle action
 * @param facetValuesSelector facet selector
 * @returns list breadcrumb of the facet selected
 */
export const getBreadcrumbs = <T extends BaseFacetValue>(
  engine: CoreEngine<
    ConfigurationSection &
      SearchSection &
      FacetSection &
      NumericFacetSection &
      DateFacetSection &
      CategoryFacetSection
  >,
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

/**
 * Creates a `BreadcrumbManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `BreadcrumbManager` controller instance.
 */
export function buildCoreBreadcrumbManager(
  engine: CoreEngine
): BreadcrumbManager {
  const controller = buildController(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    get state() {
      return {
        facetBreadcrumbs: [],
        categoryFacetBreadcrumbs: [],
        numericFacetBreadcrumbs: [],
        dateFacetBreadcrumbs: [],
        staticFilterBreadcrumbs: [],
        hasBreadcrumbs: false,
      };
    },

    deselectAll: () => {
      dispatch(deselectAllBreadcrumbs());
    },

    deselectBreadcrumb(value: DeselectableValue) {
      value.deselect();
    },
  };
}
