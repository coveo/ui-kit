import {CommerceFacetResponse} from '../../../api/commerce/product-listings/v2/facet';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {facetsReducer as commerceFacets} from '../../../features/commerce/facets/facets-slice';
import {facetOptionsReducer as facetOptions} from '../../../features/facet-options/facet-options-slice';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {
  CommerceFacetSection,
  FacetOptionsSection,
  FacetSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {buildFacet, Facet} from './headless-facet';

export interface FacetGenerator extends Controller {
  state: FacetGeneratorState;
}

export interface FacetGeneratorState {
  facets: Facet[];
}

export function buildFacetGenerator(engine: CommerceEngine): FacetGenerator {
  if (!loadFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }
  const {dispatch} = engine;
  const controller = buildController(engine);

  const createFacet = (facet: CommerceFacetResponse) => {
    const options = {
      field: facet.field,
      facetId: facet.facetId,
      displayName: facet.displayName,
    };

    let facetController;
    switch (facet.type) {
      case 'regular':
      default:
        // eslint-disable-next-line @cspell/spellchecker
        // TODO CAPI-90, CAPI-91: Use different controllers for different facet types taken from facet.type
        facetController = buildFacet(engine, {
          options,
        });
    }

    if (!engine.state.facetSet[facet.facetId]) {
      dispatch(registerFacet(options));
    }

    return facetController;
  };

  return {
    ...controller,

    get state() {
      return {
        facets: engine.state.commerceFacets.facets?.map(createFacet) ?? [],
      };
    },
  };
}

function loadFacetGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  FacetSection & FacetOptionsSection & CommerceFacetSection
> {
  engine.addReducers({facetSet, facetOptions, commerceFacets});
  return true;
}
