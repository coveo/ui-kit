import {Engine} from '../../../app/headless-engine';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  registerCategoryFacet,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryFacetResponseSelector} from '../../../features/facets/category-facet-set/category-facet-set-selectors';
import {executeSearch} from '../../../features/search/search-actions';
import {
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {defaultCategoryFacetOptions} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {categoryFacetRequestSelector} from '../../../features/facets/category-facet-set/category-facet-set-selectors';
import {buildCategoryFacetSearch} from '../facet-search/category/headless-category-facet-search';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections';
import {partitionIntoParentsAndValues} from '../../../features/facets/category-facet-set/category-facet-utils';
import {
  executeDeselectAllCategoryFacetValues,
  executeToggleCategoryFacetSelect,
} from '../../../features/facets/category-facet-set/category-facet-set-controller-actions';
import {validateOptions} from '../../../utils/validate-payload';
import {
  CategoryFacetOptions,
  categoryFacetOptionsSchema,
  CategoryFacetSearchOptions,
} from './headless-category-facet-options';
import {determineFacetId} from '../_common/facet-id-determinor';
import {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response';
import {
  categoryFacetSearchSet,
  categoryFacetSet,
  configuration,
  search,
} from '../../../app/reducers';
import {loadReducerError} from '../../../utils/errors';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';

export {CategoryFacetValue, CategoryFacetOptions, CategoryFacetSearchOptions};

export interface CategoryFacetProps {
  /** The options for the `CategoryFacet` controller. */
  options: CategoryFacetOptions;
}

/**
 * The `CategoryFacet` headless controller offers a high-level interface for designing a facet UI controller that renders values hierarchically.
 */
export interface CategoryFacet extends Controller {
  /**
   * Provides methods to search the facet's values.
   */
  facetSearch: CategoryFacetSearch;

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
   * The state of the `Facet` controller.
   * */
  state: CategoryFacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `CategoryFacet` controller.
 */
export interface CategoryFacetState {
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

  /** The state of the facet's searchbox. */
  facetSearch: CategoryFacetSearchState;
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
export function buildCategoryFacet(
  engine: Engine<object>,
  props: CategoryFacetProps
): CategoryFacet {
  if (!loadCategoryFacetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

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

  const createFacetSearch = () => {
    const {facetId, facetSearch} = options;
    const facetSearchOptions = {facetId, ...facetSearch};

    return buildCategoryFacetSearch(engine, {options: facetSearchOptions});
  };

  const getRequest = () => {
    return categoryFacetRequestSelector(engine.state, facetId);
  };

  const getResponse = () => {
    return categoryFacetResponseSelector(engine.state, facetId);
  };

  dispatch(registerCategoryFacet(options));

  const facetSearch = createFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...controller,
    facetSearch: restOfFacetSearch,

    toggleSelect: (selection: CategoryFacetValue) =>
      dispatch(
        executeToggleCategoryFacetSelect({
          facetId,
          selection,
          retrieveCount: options.numberOfValues,
        })
      ),

    deselectAll: () =>
      dispatch(executeDeselectAllCategoryFacetValues({facetId})),

    sortBy(criterion: CategoryFacetSortCriterion) {
      const facetId = options.facetId;

      dispatch(updateCategoryFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    isSortedBy(criterion: CategoryFacetSortCriterion) {
      const request = getRequest();
      return request!.sortCriteria === criterion;
    },

    showMoreValues() {
      const {facetId, numberOfValues: increment} = options;
      const {values} = this.state;
      const numberOfValues = values.length + increment;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowMore(facetId)));
    },

    showLessValues() {
      const {facetId, numberOfValues} = options;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowLess(facetId)));
    },

    get state() {
      const request = getRequest();
      const response = getResponse();

      const {parents, values} = partitionIntoParentsAndValues(response?.values);
      const isLoading = getState().search.isLoading;
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
        facetSearch: facetSearch.state,
      };
    },
  };
}

function loadCategoryFacetReducers(
  engine: Engine<object>
): engine is Engine<
  CategoryFacetSection &
    CategoryFacetSearchSection &
    ConfigurationSection &
    SearchSection
> {
  engine.addReducers({
    categoryFacetSet,
    categoryFacetSearchSet,
    configuration,
    search,
  });
  return true;
}
