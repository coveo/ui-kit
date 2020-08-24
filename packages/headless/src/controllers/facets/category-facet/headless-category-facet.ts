import {Engine} from '../../../app/headless-engine';
import {buildController} from '../../controller/headless-controller';
import {randomID} from '../../../utils/utils';
import {CategoryFacetRegistrationOptions} from '../../../features/facets/category-facet-set/interfaces/options';
import {
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {facetSelector} from '../../../features/facets/facet-set/facet-set-selectors';
import {
  CategoryFacetResponse,
  CategoryFacetValue,
} from '../../../features/facets/category-facet-set/interfaces/response';
import {executeSearch} from '../../../features/search/search-actions';
import {
  FacetSelectionChangeMetadata,
  logFacetDeselect,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';

export type CategoryFacetProps = {
  options: CategoryFacetOptions;
};

export type CategoryFacetOptions = {facetId?: string} & Omit<
  CategoryFacetRegistrationOptions,
  'facetId'
>;

export type CategoryFacet = ReturnType<typeof buildCategoryFacet>;
export type CategoryFacetState = CategoryFacet['state'];

export function buildCategoryFacet(engine: Engine, props: CategoryFacetProps) {
  const controller = buildController(engine);
  const {dispatch} = engine;

  const facetId = props.options.facetId || randomID('categoryFacet');
  const options: CategoryFacetRegistrationOptions = {facetId, ...props.options};

  const getAnalyticsActionForToggleSelect = (selection: CategoryFacetValue) => {
    const payload: FacetSelectionChangeMetadata = {
      facetId,
      facetValue: selection.value,
    };

    const isSelected = selection.state === 'selected';
    return isSelected ? logFacetDeselect(payload) : logFacetSelect(payload);
  };

  dispatch(registerCategoryFacet(options));

  return {
    ...controller,

    /**
     * Selects (deselects) the passed value if unselected (selected).
     * @param selection The category facet value to select or deselect.
     */
    toggleSelect(selection: CategoryFacetValue) {
      const analyticsAction = getAnalyticsActionForToggleSelect(selection);

      dispatch(toggleSelectCategoryFacetValue({facetId, selection}));
      dispatch(executeSearch(analyticsAction));
    },

    /**  @returns The state of the `CategoryFacet` controller.*/
    get state() {
      const response = facetSelector(engine.state, facetId) as
        | CategoryFacetResponse
        | undefined;

      const {parents, values} = partitionIntoParentsAndValues(response);
      const isLoading = engine.state.search.isLoading;

      return {parents, values, isLoading};
    },
  };
}

type CategoryFacetResponsePartition = {
  parents: CategoryFacetValue[];
  values: CategoryFacetValue[];
};

function partitionIntoParentsAndValues(
  response: CategoryFacetResponse | undefined
): CategoryFacetResponsePartition {
  if (!response) {
    return {parents: [], values: []};
  }

  let parents: CategoryFacetValue[] = [];
  let values = response.values;

  while (values.length && values[0].children.length) {
    parents = [...parents, ...values];
    values = values[0].children;
  }

  const selectedLeafValue = values.find((v) => v.state === 'selected');

  if (selectedLeafValue) {
    parents = [...parents, selectedLeafValue];
    values = [];
  }

  return {parents, values};
}
