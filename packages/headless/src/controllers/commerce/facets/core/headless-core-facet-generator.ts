import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice';
import {
  commerceFacetSetReducer as commerceFacetSet
} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {
  CommerceFacetSetSection,
  FacetOrderSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {
  CoreFacet,
  FacetBuilder,
} from './headless-core-facet';

export interface FacetGenerator extends Controller {
  state: FacetGeneratorState;
}

export interface FacetGeneratorState {
  facets: CoreFacet[];
}

export interface FacetGeneratorOptions {
  buildFacet: FacetBuilder;
}

export function buildCoreFacetGenerator(engine: CommerceEngine, options: FacetGeneratorOptions): FacetGenerator {
  if (!loadFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  const createFacet = (facetId: string) => {
    const {type} = engine.state.commerceFacetSet[facetId].request

    switch (type) {
      case 'regular':
      default:
        // eslint-disable-next-line @cspell/spellchecker
        // TODO CAPI-90, CAPI-91: Use different controllers for different facet types taken from facet.type
        return options.buildFacet(engine, {
          options: {
            facetId,
          }
        });
    }
  };

  return {
    ...controller,

    get state() {
      return {
        facets: engine.state.facetOrder.map(createFacet) ?? [],
      };
    },
  };
}

function loadFacetGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  FacetOrderSection & CommerceFacetSetSection
> {
  engine.addReducers({facetOrder, commerceFacetSet});
  return true;
}
