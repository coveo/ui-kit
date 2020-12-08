import {Engine} from '../../../app/headless-engine';
import {buildController} from '../../controller/headless-controller';
import {CategoryFacetRegistrationOptions} from '../../../features/facets/category-facet-set/interfaces/options';
import {
  registerCategoryFacet,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryFacetResponseSelector} from '../../../features/facets/category-facet-set/category-facet-set-selectors';
import {CategoryFacetValue} from '../../../features/facets/category-facet-set/interfaces/response';
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
} from './headless-category-facet-options';
import {determineFacetId} from '../_common/facet-id-determinor';

export {CategoryFacetOptions};
export type CategoryFacetProps = {
  options: CategoryFacetOptions;
};
export type CategoryFacet = ReturnType<typeof buildCategoryFacet>;
export type CategoryFacetState = CategoryFacet['state'];

export function buildCategoryFacet(
  engine: Engine<
    CategoryFacetSection &
      SearchSection &
      ConfigurationSection &
      CategoryFacetSearchSection
  >,
  props: CategoryFacetProps
) {
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
    buildCategoryFacet.name
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

    /**
     * Selects (deselects) the passed value if unselected (selected).
     * @param selection The category facet value to select or deselect.
     */
    toggleSelect: (selection: CategoryFacetValue) =>
      dispatch(executeToggleCategoryFacetSelect({facetId, selection})),

    /** Deselects all facet values.*/
    deselectAll: () =>
      dispatch(
        executeDeselectAllCategoryFacetValues({
          facetId,
          numberOfValues: options.numberOfValues!,
        })
      ),

    /** Sorts the category facet values according to the passed criterion.
     * @param {CategoryFacetSortCriterion} criterion The criterion to sort values by.
     */
    sortBy(criterion: CategoryFacetSortCriterion) {
      const facetId = options.facetId;

      dispatch(updateCategoryFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    /**
     * Returns `true` if the category facet values are sorted according to the passed criterion and `false` otherwise.
     * @param {CategoryFacetSortCriterion} criterion The criterion to compare.
     */
    isSortedBy(criterion: CategoryFacetSortCriterion) {
      const request = getRequest();
      return request.sortCriteria === criterion;
    },
    /**
     * Displays more values for the current selected category if they exist
     */
    showMoreValues() {
      const {facetId, numberOfValues: increment} = options;
      const {values} = this.state;
      const numberOfValues = values.length + increment;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowMore(facetId)));
    },
    /**
     * Resets the number of displayed values to the initially configured value
     */
    showLessValues() {
      const {facetId, numberOfValues} = options;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowLess(facetId)));
    },

    /**  @returns The state of the `CategoryFacet` controller.*/
    get state() {
      const request = getRequest();
      const response = getResponse();

      const {parents, values} = partitionIntoParentsAndValues(response);
      const isLoading = engine.state.search.isLoading;
      const hasActiveValues = parents.length !== 0;
      const canShowMoreValues =
        parents.length > 0
          ? parents[parents.length - 1].moreValuesAvailable
          : response?.moreValuesAvailable || false;
      const canShowLessValues = values.length > options.numberOfValues;

      return {
        parents,
        values,
        isLoading,
        hasActiveValues,
        canShowMoreValues,
        canShowLessValues,
        sortCriteria: request.sortCriteria,
        facetSearch: facetSearch.state,
      };
    },
  };
}
