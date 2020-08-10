import {Engine} from '../../../app/headless-engine';
import {buildController} from '../../controller/headless-controller';
import {randomID} from '../../../utils/utils';
import {CategoryFacetRegistrationOptions} from '../../../features/facets/category-facet-set/interfaces/options';
import {registerCategoryFacet} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {facetSelector} from '../../../features/facets/facet-set/facet-set-selectors';
import {CategoryFacetResponse} from '../../../features/facets/category-facet-set/interfaces/response';

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

  dispatch(registerCategoryFacet(options));

  return {
    ...controller,
    get state() {
      const response = facetSelector(engine.state, facetId) as
        | CategoryFacetResponse
        | undefined;
      const values = response ? response.values : [];
      const isLoading = engine.state.search.isLoading;
      return {values, isLoading};
    },
  };
}
