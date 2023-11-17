import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice';
import {
  CommerceFacetSetSection,
  FacetOrderSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {Facet, FacetBuilder} from './headless-core-facet';

/**
 * The `FacetGenerator` headless controller creates commerce facet controllers from the Commerce API search or product listing response.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub (CMH). The implementer is only responsible for leveraging the facet controllers created by the `FacetGenerator` controller to properly render facets in their application.
 */
export interface FacetGenerator extends Controller {
  /**
   * The state of the `FacetGenerator` controller.
   */
  state: FacetGeneratorState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `FacetGenerator` controller.
 */
export interface FacetGeneratorState {
  /**
   * The list of commerce facet controllers.
   */
  facets: Facet[];
}

/**
 * The options for the `FacetGenerator` controller.
 */
export interface FacetGeneratorOptions {
  /**
   * The facet builder for the `FacetGenerator` controller.
   */
  buildFacet: FacetBuilder;
}

/**
 * Creates a `FacetGenerator` instance.
 *
 * @param engine - The headless engine.
 * @param options - The facet generator options.
 * @returns A `FacetGenerator` controller instance.
 */
export function buildCoreFacetGenerator(
  engine: CommerceEngine,
  options: FacetGeneratorOptions
): FacetGenerator {
  if (!loadFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  const createFacet = (facetId: string) => {
    const {type} = engine.state.commerceFacetSet[facetId].request;

    switch (type) {
      case 'regular':
      default:
        // eslint-disable-next-line @cspell/spellchecker
        // TODO CAPI-90, CAPI-91: Use different controllers for different facet types taken from facet.type
        return options.buildFacet(engine, {
          options: {
            facetId,
          },
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
): engine is CommerceEngine<FacetOrderSection & CommerceFacetSetSection> {
  engine.addReducers({facetOrder, commerceFacetSet});
  return true;
}
