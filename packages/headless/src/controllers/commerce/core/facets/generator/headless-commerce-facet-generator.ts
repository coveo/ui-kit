import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../../app/state-key';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {CommerceFacetSetState} from '../../../../../features/commerce/facets/facet-set/facet-set-state';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/common';
import {AnyFacetValueResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice';
import {AnyFacetValueRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request';
import {
  CommerceFacetSetSection,
  FacetOrderSection,
} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  Controller,
  buildController,
} from '../../../../controller/headless-controller';
import {CategoryFacet} from '../category/headless-commerce-category-facet';
import {DateFacet} from '../date/headless-commerce-date-facet';
import {
  CommerceFacetOptions,
  CoreCommerceFacet,
} from '../headless-core-commerce-facet';
import {NumericFacet} from '../numeric/headless-commerce-numeric-facet';
import {RegularFacet} from '../regular/headless-commerce-regular-facet';

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
   * The ordered list of facet IDs for which controllers will be created and returned when the `facets` getter is called.
   */
  state: string[];

  /**
   * The facet controllers created by the facet generator.
   */
  facets: GeneratedFacetControllers;
}

export type GeneratedFacetControllers = Array<
  MappedGeneratedFacetController[FacetType]
>;

type MappedGeneratedFacetController = {
  [T in FacetType]: T extends 'numericalRange'
    ? NumericFacet
    : T extends 'regular'
      ? RegularFacet
      : T extends 'dateRange'
        ? DateFacet
        : T extends 'hierarchical'
          ? CategoryFacet
          : never;
};

type CommerceFacetBuilder<
  Facet extends Omit<
    CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>,
    | 'isValueExcluded'
    | 'toggleExclude'
    | 'toggleSingleExclude'
    | 'toggleSingleSelect'
  >,
> = (engine: CommerceEngine, options: CommerceFacetOptions) => Facet;

/**
 * @internal
 *
 * The `FacetGenerator` options used internally.
 */
export interface FacetGeneratorOptions {
  buildRegularFacet: CommerceFacetBuilder<RegularFacet>;
  buildNumericFacet: CommerceFacetBuilder<NumericFacet>;
  buildDateFacet: CommerceFacetBuilder<DateFacet>;
  buildCategoryFacet: CommerceFacetBuilder<CategoryFacet>;
}

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

  const createFacetControllers = createSelector(
    [
      (state: CommerceEngineState) => state.facetOrder,
      (state: CommerceEngineState) => state.commerceFacetSet,
    ],

    (facetOrder, commerceFacetSet) =>
      facetOrder.map((facetId: string) =>
        createFacetController(commerceFacetSet, facetId)
      )
  );

  const createFacetController = createSelector(
    (commerceFacetSet: CommerceFacetSetState, facetId: string) => ({
      facetId,
      type: commerceFacetSet[facetId].request.type,
    }),

    ({type, facetId}) => {
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
    }
  );

  return {
    ...controller,

    get facets() {
      return createFacetControllers(engine[stateKey]);
    },

    get state() {
      return engine[stateKey].facetOrder;
    },
  };
}

function loadCommerceFacetGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetOrderSection & CommerceFacetSetSection> {
  engine.addReducers({facetOrder, commerceFacetSet});
  return true;
}
