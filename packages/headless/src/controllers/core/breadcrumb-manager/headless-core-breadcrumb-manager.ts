import type {CoreEngine} from '../../../app/engine.js';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions.js';
import type {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response.js';
import type {BaseFacetValue} from '../../../features/facets/facet-api/response.js';
import type {FacetValueRequest} from '../../../features/facets/facet-set/interfaces/request.js';
import type {FacetValue} from '../../../features/facets/facet-set/interfaces/response.js';
import type {AnyFacetSetState} from '../../../features/facets/generic/interfaces/generic-facet-section.js';
import type {DateRangeRequest} from '../../../features/facets/range-facets/date-facet-set/interfaces/request.js';
import type {DateFacetValue} from '../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import type {NumericRangeRequest} from '../../../features/facets/range-facets/numeric-facet-set/interfaces/request.js';
import type {NumericFacetValue} from '../../../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
import type {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {StaticFilterValue} from '../../static-filter/headless-static-filter.js';

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
   * Returns `true` if there are any available breadcrumbs (that is, if there are any active facet values), and `false` if not.
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
 * @param executeToggleSelect execute the toggle select action
 * @param executeToggleExclude execute the toggle exclude action
 * @param facetValuesSelector facet selector
 * @returns list breadcrumb of the facet selected
 */
export type GetBreadcrumbsConfiguration<T extends AnyFacetSetState> = {
  engine: CoreEngine<
    ConfigurationSection &
      SearchSection &
      FacetSection &
      NumericFacetSection &
      DateFacetSection &
      CategoryFacetSection
  >;
  facetSet: T;
  executeToggleSelect: (payload: {
    facetId: string;
    selection: InferFacetSliceValueType<T>;
  }) => void;
  executeToggleExclude: (payload: {
    facetId: string;
    selection: InferFacetSliceValueType<T>;
  }) => void;
  facetValuesSelector: (
    state: CoreEngine<
      ConfigurationSection &
        SearchSection &
        FacetSection &
        NumericFacetSection &
        DateFacetSection &
        CategoryFacetSection
    >['state'],
    facetId: string
  ) => InferFacetSliceValueType<T>[];
};

type InferFacetSliceValueRequestType<T extends AnyFacetSetState> =
  T[string]['request']['currentValues'][number];

type InferFacetSliceValueType<T extends AnyFacetSetState> =
  InferFacetSliceValueRequestType<T> extends FacetValueRequest
    ? FacetValue
    : InferFacetSliceValueRequestType<T> extends NumericRangeRequest
      ? NumericFacetValue
      : InferFacetSliceValueRequestType<T> extends DateRangeRequest
        ? DateFacetValue
        : CategoryFacetValue;

export const getBreadcrumbs = <T extends AnyFacetSetState>(
  config: GetBreadcrumbsConfiguration<T>
): Breadcrumb<InferFacetSliceValueType<T>>[] => {
  return Object.keys(config.facetSet)
    .map((facetId) => {
      const values = config
        .facetValuesSelector(config.engine.state, facetId)
        .map((selection) => ({
          value: selection,
          deselect: () => {
            if (selection.state === 'selected') {
              config.executeToggleSelect({facetId, selection});
            } else if (selection.state === 'excluded') {
              config.executeToggleExclude({facetId, selection});
            }
          },
        }));

      return {
        facetId,
        field: config.facetSet[facetId]!.request.field,
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
