import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../../app/commerce-engine/commerce-engine';
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
import {CategoryFacet} from '../category/headless-commerce-category-facet';
import {DateFacet} from '../date/headless-commerce-date-facet';
import {
  CommerceFacetOptions,
  CoreCommerceFacet,
} from '../headless-core-commerce-facet';
import {NumericFacet} from '../numeric/headless-commerce-numeric-facet';
import {RegularFacet} from '../regular/headless-commerce-regular-facet';
import {SearchableFacetOptions} from '../searchable/headless-commerce-searchable-facet';

/**
 * The `FacetGenerator` headless controller creates commerce facet controllers from the Commerce API search or
 * product listing response.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by this controller to
 * properly render facets in their application.
 */
export interface FacetGenerator extends Controller {
  /**
   * The state of the facet generator controller.
   */
  state: FacetGeneratorState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the facet generator controller.
 */
export interface FacetGeneratorState {
  /**
   * The generated commerce facet controllers.
   */
  facets: AnyCommerceFacetController[];
}

type CommerceFacetBuilder<
  Facet extends Omit<
    CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>,
    | 'isValueExcluded'
    | 'toggleExclude'
    | 'toggleSingleExclude'
    | 'toggleSingleSelect'
  >,
> = (engine: CommerceEngine, options: CommerceFacetOptions) => Facet;

type CommerceSearchableFacetBuilder<
  Facet extends CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>,
> = (
  engine: CommerceEngine,
  options: CommerceFacetOptions & SearchableFacetOptions
) => Facet;
/**
 * @internal
 *
 * The `FacetGenerator` options used internally.
 */
export interface FacetGeneratorOptions {
  buildRegularFacet: CommerceSearchableFacetBuilder<RegularFacet>;
  buildNumericFacet: CommerceFacetBuilder<NumericFacet>;
  buildDateFacet: CommerceFacetBuilder<DateFacet>;
  buildCategoryFacet: CommerceFacetBuilder<CategoryFacet>;
}

export type AnyCommerceFacetController =
  | RegularFacet
  | NumericFacet
  | DateFacet
  | CategoryFacet;

/**
 * @internal
 *
 * Creates a `FacetGenerator` instance.
 *
 * @param engine - The headless commerce engine.
 * @param options - The facet generator options used internally.
 * @returns A `FacetGenerator` controller instance.
 */
export function buildFacetGenerator(
  engine: CommerceEngine,
  options: FacetGeneratorOptions
): FacetGenerator {
  if (!loadCommerceFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  const commerceFacetSelector = createSelector(
    (state: CommerceEngineState) => state.facetOrder,
    (facetOrder) => ({facets: facetOrder.map(createFacet) ?? []})
  );

  const createFacet = (facetId: string) => {
    const {type} = engine.state.commerceFacetSet[facetId].request;

    switch (type) {
      case 'dateRange':
        return options.buildDateFacet(engine, {facetId});
      case 'hierarchical':
        return options.buildCategoryFacet(engine, {facetId});
      case 'numericalRange':
        return options.buildNumericFacet(engine, {facetId});
      case 'regular':
        return options.buildRegularFacet(engine, {facetId});
    }
  };

  return {
    ...controller,

    get state() {
      return commerceFacetSelector(engine.state);
    },
  };
}

function loadCommerceFacetGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetOrderSection & CommerceFacetSetSection> {
  engine.addReducers({facetOrder, commerceFacetSet});
  return true;
}
