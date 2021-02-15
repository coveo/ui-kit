import {Engine} from '../../../app/headless-engine';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {CategoryFacetRegistrationOptions} from '../../../features/facets/category-facet-set/interfaces/options';
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
import {FacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
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
import {FacetSearch} from '../facet/headless-facet';
import {
  BaseFacetSearchResult,
  BaseFacetSearchState,
  BaseFacetState,
  BaseFacetValue,
} from '../_common/base-facet';

export {CategoryFacetOptions, CategoryFacetSearchOptions};

export interface CategoryFacetProps {
  /** The options for the `CategoryFacet` controller. */
  options: CategoryFacetOptions;
}

/**
 * The `CategoryFacet` headless controller offers a high-level interface for designing a facet UI controller that renders values in a hierarchical fashion.
 */
export interface CategoryFacet extends Controller {
  facetSearch: CategoryFacetSearch;

  /**
   * Toggles the specified facet value.
   * @param selection The facet value to toggle.
   */
  toggleSelect: (selection: CategoryFacetValue) => void;

  /** Deselects all facet values.*/
  deselectAll: () => void;

  /** Sorts the facet values according to the specified criterion.
   * @param criterion The criterion to sort values by.
   */
  sortBy: (criterion: CategoryFacetSortCriterion) => void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   * @param criterion The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy: (criterion: CategoryFacetSortCriterion) => boolean;

  /**
   * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
   */
  showMoreValues: () => void;

  /** Sets the displayed number of values to the originally configured value. */
  showLessValues: () => void;

  state: CategoryFacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `CategoryFacet` controller.
 */
export interface CategoryFacetState extends BaseFacetState {
  /** The facet id. */
  facetId: string;

  /** The parent values of the facet. */
  parents: CategoryFacetValue[];

  /** The values of the facet. */
  values: CategoryFacetValue[];

  /** `true` if there are more values to display and `false` otherwise. */
  canShowMoreValues: boolean | undefined;

  /** The active sortCriterion of the facet. */
  sortCriteria: CategoryFacetSortCriterion;

  /** The state of the facet's searchbox. */
  facetSearch: CategoryFacetSearchState;
}

export interface CategoryFacetSearch extends FacetSearch {
  select(value: CategoryFacetSearchResult): void;
}

export interface CategoryFacetSearchState extends BaseFacetSearchState {
  /** search results */
  values: CategoryFacetSearchResult[];
}

export interface CategoryFacetSearchResult extends BaseFacetSearchResult {
  /**
   * The hierarchical path to the value.
   */
  path: string[];
}

export interface CategoryFacetValue extends BaseFacetValue {
  /**
   * The hierarchical path to the value.
   */
  path: string[];

  /**
   * The children of this facet value.
   */
  children: CategoryFacetValue[];

  /**
   * Whether more values are available.
   * */
  moreValuesAvailable?: boolean;
}

export function buildCategoryFacet(
  engine: Engine<
    CategoryFacetSection &
      SearchSection &
      ConfigurationSection &
      CategoryFacetSearchSection
  >,
  props: CategoryFacetProps
): CategoryFacet {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const facetId = determineFacetId(engine, props.options);
  const options: Required<CategoryFacetRegistrationOptions> = {
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
    const {facetSearch} = props.options;
    const facetSearchOptions: FacetSearchOptions = {
      facetId,
      ...facetSearch,
    };

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

    toggleSelect: (selection) =>
      dispatch(
        executeToggleCategoryFacetSelect({
          facetId,
          selection,
          retrieveCount: options.numberOfValues,
        })
      ),

    deselectAll: () =>
      dispatch(executeDeselectAllCategoryFacetValues({facetId})),

    sortBy(criterion) {
      const facetId = options.facetId;

      dispatch(updateCategoryFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    isSortedBy(criterion) {
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
      const isLoading = engine.state.search.isLoading;
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
