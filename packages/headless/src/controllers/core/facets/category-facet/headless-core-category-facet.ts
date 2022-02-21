import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {
  deselectAllCategoryFacetValues,
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryFacetResponseSelector} from '../../../../features/facets/category-facet-set/category-facet-set-selectors';
import {defaultCategoryFacetOptions} from '../../../../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetSortCriterion} from '../../../../features/facets/category-facet-set/interfaces/request';
import {categoryFacetRequestSelector} from '../../../../features/facets/category-facet-set/category-facet-set-selectors';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from '../../../../features/facet-options/facet-options-actions';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../state/state-sections';
import {partitionIntoParentsAndValues} from '../../../../features/facets/category-facet-set/category-facet-utils';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  CategoryFacetOptions,
  categoryFacetOptionsSchema,
  CategoryFacetSearchOptions,
} from './headless-core-category-facet-options';
import {determineFacetId} from '../_common/facet-id-determinor';
import {CategoryFacetValue} from '../../../../features/facets/category-facet-set/interfaces/response';
import {
  categoryFacetSearchSet,
  categoryFacetSet,
  facetOptions,
  configuration,
  search,
} from '../../../../app/reducers';
import {loadReducerError} from '../../../../utils/errors';
import {defaultFacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {CoreEngine} from '../../../../app/engine';
import {isFacetLoadingResponseSelector} from '../../../../features/facets/facet-set/facet-set-selectors';
import {isFacetEnabledSelector} from '../../../../features/facet-options/facet-options-selectors';

export type {
  CategoryFacetValue,
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
};

export interface CategoryFacetProps {
  /** The options for the `CategoryFacet` controller. */
  options: CategoryFacetOptions;
}

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
   * Enables the facet
   */
  enable(): void;

  /**
   * Disables the facet
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

  /** The facet's parent values. */
  parents: CategoryFacetValue[];

  /** The facet's values. */
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
  const options: Required<CategoryFacetOptions> = {
    facetSearch: {...defaultFacetSearchOptions},
    ...defaultCategoryFacetOptions,
    ...props.options,
    facetId,
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

  dispatch(registerCategoryFacet(options));

  return {
    ...controller,

    toggleSelect(selection: CategoryFacetValue) {
      const retrieveCount = options.numberOfValues;
      dispatch(
        toggleSelectCategoryFacetValue({facetId, selection, retrieveCount})
      );
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
    },

    deselectAll() {
      dispatch(deselectAllCategoryFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      dispatch(updateCategoryFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
    },

    isSortedBy(criterion: CategoryFacetSortCriterion) {
      const request = getRequest();
      return request!.sortCriteria === criterion;
    },

    showMoreValues() {
      const {numberOfValues: increment} = options;
      const {values} = this.state;
      const numberOfValues = values.length + increment;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
    },

    showLessValues() {
      const {numberOfValues} = options;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
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

      const {parents, values} = partitionIntoParentsAndValues(response?.values);
      const hasActiveValues = parents.length !== 0;
      const canShowMoreValues =
        parents.length > 0
          ? parents[parents.length - 1].moreValuesAvailable
          : response?.moreValuesAvailable || false;
      const canShowLessValues = values.length > options.numberOfValues;

      return {
        facetId,
        parents,
        values,
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
