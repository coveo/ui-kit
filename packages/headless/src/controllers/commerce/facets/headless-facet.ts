import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {facetsReducer as commerceFacets} from '../../../features/commerce/facets/facets-slice';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {
  CommerceFacetSection,
  FacetSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {buildController} from '../../controller/headless-controller';
import {determineFacetId} from '../../core/facets/_common/facet-id-determinor';
import {
  CoreFacet,
  CoreFacetState,
} from '../../core/facets/facet/headless-core-facet';
import {FacetOptions as CoreFacetOptions} from '../../core/facets/facet/headless-core-facet-options';

export type Facet = Omit<
  CoreFacet,
  'sortBy' | 'isSortedBy' | 'enable' | 'disable' | 'state'
> & {
  state: FacetState;
};

export type FacetState = Omit<
  CoreFacetState,
  'enabled' | 'sortCriterion' | 'isLoading'
>;

export interface FacetProps {
  options: FacetOptions;
}

export type FacetOptions = Pick<
  CoreFacetOptions,
  'facetId' | 'field' | 'numberOfValues'
>;

export function buildFacet(engine: CommerceEngine, props: FacetProps): any {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildController(engine);
  const facetId = determineFacetId(engine, props.options);

  return {
    ...coreController,

    get state() {
      return {
        facetId,
      };
    },
  };
}

function loadFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetSection & CommerceFacetSection> {
  engine.addReducers({facetSet, commerceFacets});
  return true;
}
