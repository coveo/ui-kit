import {configuration} from '../../../../app/common-reducers';
import {CoreEngine} from '../../../../app/engine';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from '../../../../features/facet-options/facet-options-actions';
import {isFacetEnabledSelector} from '../../../../features/facet-options/facet-options-selectors';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice';
import {
  deselectAllCategoryFacetValues,
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryFacetResponseSelector} from '../../../../features/facets/category-facet-set/category-facet-set-selectors';
import {categoryFacetRequestSelector} from '../../../../features/facets/category-facet-set/category-facet-set-selectors';
import {defaultCategoryFacetOptions} from '../../../../features/facets/category-facet-set/category-facet-set-slice';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../../features/facets/category-facet-set/category-facet-set-slice';
import {
  getActiveValueFromValueTree,
  partitionIntoParentsAndValues,
} from '../../../../features/facets/category-facet-set/category-facet-utils';
import {CategoryFacetSortCriterion} from '../../../../features/facets/category-facet-set/interfaces/request';
import {CategoryFacetValue} from '../../../../features/facets/category-facet-set/interfaces/response';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {defaultFacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {isFacetLoadingResponseSelector} from '../../../../features/facets/facet-set/facet-set-selectors';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {omit} from '../../../../utils/utils';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {determineFacetId} from '../_common/facet-id-determinor';
import {
  CategoryFacetOptions,
  categoryFacetOptionsSchema,
  CategoryFacetSearchOptions,
} from './headless-core-category-facet-options';

export type {
  CategoryFacetValue,
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
};

export interface CategoryFacetProps {
  /** The options for the `CategoryFacet` controller. */
  options: CategoryFacetOptions;
}

/**
 * The `CategoryFacet` headless controller offers a high-level interface for designing a facet UI controller that renders values hierarchically.
 */
export interface CategoryFacet extends CoreCategoryFacet {
  /**
   * Provides methods to search the facet's values.
   */
  facetSearch: CategoryFacetSearch;

  /**
   * The state of the `Facet` controller.
   * */
  state: CategoryFacetState;
}

/**
 * The `CategoryFacet` headless controller offers a high-level interface for designing a facet UI controller that renders values hierarchically.
 */
export interface CoreCategoryFacet extends Controller {
  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: CategoryFacetValue): void;

  /**
   * Deselects all facet values.
   * */
  deselectAll(): void;

  /**
   * Sorts the facet values according to the specified criterion.
   *
   * @param criterion - The criterion by which to sort values.
   */
  sortBy(criterion: CategoryFacetSortCriterion): void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   *
   * @param criterion - The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy(criterion: CategoryFacetSortCriterion): boolean;

  /**
   * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
   */
  showMoreValues(): void;

  /**
   * Sets the number of values displayed in the facet to the originally configured value.
   * */
  showLessValues(): void;

  /**
   * Enables the facet. I.e., undoes the effects of `disable`.
   */
  enable(): void;

  /**
   * Disables the facet. I.e., prevents it from filtering results.
   */
  disable(): void;

  /**
   * The state of the `Facet` controller.
   * */
  state: CoreCategoryFacetState;
}

export interface CategoryFacetState extends CoreCategoryFacetState {
  /** The state of the facet's searchbox. */
  facetSearch: CategoryFacetSearchState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `CategoryFacet` controller.
 */
export interface CoreCategoryFacetState {
  /** The facet ID. */
  facetId: string;

  /**
   * The root facet values.
   * Child values might be available in `valuesAsTrees[i].children[j]`
   * @example `{value: 'foo' }
   */
  valuesAsTrees: CategoryFacetValue[];

  /**
   * The facet's selected value if any, undefined otherwise.
   */
  activeValue: CategoryFacetValue | undefined;

  /**
   * Whether `valuesAsTree` contains hierarchical values (i.e. facet values with children), or only 'flat' values (i.e. facet values without children).
   */
  isHierarchical: boolean;

  /**
   * The facet's parent values.
   * @deprecated uses `valuesAsTrees` instead.
   *
   */
  parents: CategoryFacetValue[];

  /**
   * The facet's values.
   * @deprecated use `valuesAsTrees` instead.
   */
  values: CategoryFacetValue[];

  /** The facet's active `sortCriterion`. */
  sortCriteria: CategoryFacetSortCriterion;

  /** Returns `true` if a search is in progress, and `false` if not. */
  isLoading: boolean;

  /** Returns `true` if there's at least one non-idle value, and `false` if not. */
  hasActiveValues: boolean;

  /** Returns `true` if there are more values to display and, `false` if not. */
  canShowMoreValues: boolean;

  /** Returns `true` if fewer values can be displayed, and `false` if not. */
  canShowLessValues: boolean;

  /** Whether the facet is enabled and its values are used to filter search results. */
  enabled: boolean;
}

export interface CategoryFacetSearch {
  /**
   * Updates the facet search query.
   *
   * @param text - The facet search query.
   * */
  updateText(text: string): void;

  /**
   * Shows more facet search results.
   * */
  showMoreResults(): void;

  /**
   * Performs a facet search.
   * */
  search(): void;

  /**
   * Selects a facet search result.
   *
   * @param value - The search result to select.
   * */
  select(value: CategoryFacetSearchResult): void;

  /**
   * Resets the query and empties the values.
   * */
  clear(): void;

  /**
   * Updates the facet value captions.
   * @param captions - A dictionary that maps index field values to facet value display names.
   */
  updateCaptions(captions: Record<string, string>): void;
}

export interface CategoryFacetSearchState {
  /**
   * The facet search results.
   * */
  values: CategoryFacetSearchResult[];

  /**
   * Returns `true` if the facet search is in progress, and `false` if not.
   * */
  isLoading: boolean;

  /**
   * Whether more values are available.
   * */
  moreValuesAvailable: boolean;

  /**
   * The current query in the facet search box.
   */
  query: string;
}

export interface CategoryFacetSearchResult {
  /**
   * The custom facet value display name, as specified in the `captions` argument of the facet request.
   */
  displayValue: string;

  /**
   * The original facet value, as retrieved from the field in the index.
   */
  rawValue: string;

  /**
   * An estimate of the number of result items that match both the current query and
   * the filter expression which would be generated if the facet value were selected.
   */
  count: number;

  /**
   * The hierarchical path to the facet value.
   */
  path: string[];
}

/**
 * Creates a `CategoryFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `CategoryFacet` properties.
 * @returns A `CategoryFacet` controller instance.
 * */
export function buildCoreCategoryFacet(
  engine: CoreEngine,
  props: CategoryFacetProps
): CoreCategoryFacet {
  if (!loadCategoryFacetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const facetId = determineFacetId(engine, props.options);
  const registrationOptions = {
    ...defaultCategoryFacetOptions,
    ...omit('facetSearch', props.options),
    field: props.options.field,
    facetId,
  };
  const options: Required<CategoryFacetOptions> = {
    facetSearch: {...defaultFacetSearchOptions, ...props.options.facetSearch},
    ...registrationOptions,
  };

  validateOptions(
    engine,
    categoryFacetOptionsSchema,
    options,
    'buildCategoryFacet'
  );

  const getRequest = () => {
    return categoryFacetRequestSelector(engine.state, facetId);
  };

  const getResponse = () => {
    return categoryFacetResponseSelector(engine.state, facetId);
  };

  const getIsLoading = () => isFacetLoadingResponseSelector(engine.state);
  const getIsEnabled = () => isFacetEnabledSelector(engine.state, facetId);

  dispatch(registerCategoryFacet(registrationOptions));

  return {
    ...controller,

    toggleSelect(selection: CategoryFacetValue) {
      const retrieveCount = options.numberOfValues;
      dispatch(
        toggleSelectCategoryFacetValue({facetId, selection, retrieveCount})
      );
      dispatch(updateFacetOptions());
    },

    deselectAll() {
      dispatch(deselectAllCategoryFacetValues(facetId));
      dispatch(updateFacetOptions());
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      dispatch(updateCategoryFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions());
    },

    isSortedBy(criterion: CategoryFacetSortCriterion) {
      const request = getRequest();
      return request!.sortCriteria === criterion;
    },

    showMoreValues() {
      const {numberOfValues: increment} = options;
      const {activeValue, valuesAsTrees} = this.state;
      const numberOfValues =
        (activeValue?.children.length ?? valuesAsTrees.length) + increment;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions());
    },

    showLessValues() {
      const {numberOfValues} = options;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions());
    },

    enable() {
      dispatch(enableFacet(facetId));
    },

    disable() {
      dispatch(disableFacet(facetId));
    },

    get state() {
      const request = getRequest();
      const response = getResponse();
      const isLoading = getIsLoading();
      const enabled = getIsEnabled();
      const valuesAsTrees = response?.values ?? [];
      const isHierarchical =
        valuesAsTrees.some((value) => value.children.length > 0) ?? false;
      const {parents, values} = partitionIntoParentsAndValues(response?.values);
      const activeValue = getActiveValueFromValueTree(valuesAsTrees);
      const hasActiveValues = !!activeValue;
      const canShowMoreValues =
        activeValue?.moreValuesAvailable ??
        response?.moreValuesAvailable ??
        false;
      const canShowLessValues = activeValue
        ? activeValue.children.length > options.numberOfValues
        : valuesAsTrees.length > options.numberOfValues;

      return {
        facetId,
        parents,
        values,
        isHierarchical,
        valuesAsTrees,
        activeValue,
        isLoading,
        hasActiveValues,
        canShowMoreValues,
        canShowLessValues,
        sortCriteria: request!.sortCriteria,
        enabled,
      };
    },
  };
}

function loadCategoryFacetReducers(
  engine: CoreEngine
): engine is CoreEngine<
  CategoryFacetSection &
    FacetOptionsSection &
    CategoryFacetSearchSection &
    ConfigurationSection &
    SearchSection
> {
  engine.addReducers({
    categoryFacetSet,
    categoryFacetSearchSet,
    facetOptions,
    configuration,
    search,
  });
  return true;
}
