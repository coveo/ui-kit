import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {facetsReducer as commerceFacets} from '../../../../features/commerce/facets/facets-slice';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice';
import {facetSetReducer as facetSet} from '../../../../features/facets/facet-set/facet-set-slice';
import {
  CommerceFacetSection,
  FacetOptionsSection,
  FacetSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {buildFacet, Facet} from './headless-product-listing-facet';

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
  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      return {
        facets: (engine.state.commerceFacets.facets ?? []).map((facet) =>
          // TODO: Eventually, we'll use different controllers for different facet types taken from facet.type
          buildFacet(engine, {
            options: {
              facetId: facet.facetId,
              field: facet.field,
            },
          })
        ),
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
