import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {AnyFacetValueResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice';
import {AnyFacetValueRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request';
import {
  CommerceFacetSetSection,
  FacetOrderSection,
} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../../controller/headless-controller';
import {CommerceDateFacet} from '../date/headless-commerce-date-facet';
import {
  CommerceFacetOptions,
  CoreCommerceFacet,
} from '../headless-core-commerce-facet';
import {CommerceNumericFacet} from '../numeric/headless-commerce-numeric-facet';
import {CommerceRegularFacet} from '../regular/headless-commerce-regular-facet';
import {CommerceSearchableFacetOptions} from '../searchable/headless-commerce-searchable-facet';

/**
 * The `CommerceFacetGenerator` headless controller creates commerce facet controllers from the Commerce API search or
 * product listing response.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by this controller to
 * properly render facets in their application.
 */
export interface CommerceFacetGenerator extends Controller {
  /**
   * The state of the facet generator controller.
   */
  state: CommerceFacetGeneratorState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the facet generator controller.
 */
export interface CommerceFacetGeneratorState {
  /**
   * The generated commerce facet controllers.
   */
  facets: CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>[];
}

type CommerceFacetBuilder<
  Facet extends CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>,
> = (engine: CommerceEngine, options: CommerceFacetOptions) => Facet;

type CommerceSearchableFacetBuilder<
  Facet extends CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>,
> = (
  engine: CommerceEngine,
  options: CommerceFacetOptions & CommerceSearchableFacetOptions
) => Facet;
/**
 * @internal
 *
 * The `CommerceFacetGenerator` options used internally.
 */
export interface CommerceFacetGeneratorOptions {
  buildRegularFacet: CommerceSearchableFacetBuilder<CommerceRegularFacet>;
  buildNumericFacet: CommerceFacetBuilder<CommerceNumericFacet>;
  buildDateFacet: CommerceFacetBuilder<CommerceDateFacet>;
  // TODO: buildCategoryFacet: CommerceFacetBuilder<CommerceCategoryFacet>;
}

/**
 * @internal
 *
 * Creates a `CommerceFacetGenerator` instance.
 *
 * @param engine - The headless commerce engine.
 * @param options - The facet generator options used internally.
 * @returns A `CommerceFacetGenerator` controller instance.
 */
export function buildCommerceFacetGenerator(
  engine: CommerceEngine,
  options: CommerceFacetGeneratorOptions
): CommerceFacetGenerator {
  if (!loadCommerceFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  const createFacet = (facetId: string) => {
    const {type} = engine.state.commerceFacetSet[facetId].request;

    switch (type) {
      case 'numericalRange':
        return options.buildNumericFacet(engine, {facetId});
      case 'dateRange':
        return options.buildDateFacet(engine, {facetId});
      case 'hierarchical': // TODO return options.buildCategoryFacet(engine, {facetId});
      case 'regular':
      default:
        return options.buildRegularFacet(engine, {facetId});
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

function loadCommerceFacetGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetOrderSection & CommerceFacetSetSection> {
  engine.addReducers({facetOrder, commerceFacetSet});
  return true;
}
