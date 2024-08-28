import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../../app/state-key';
import {clearAllCoreFacets} from '../../../../../features/commerce/facets/core-facet/core-facet-actions';
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
import {FetchProductsActionCreator} from '../../common';
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
 * The `FacetGenerator` headless sub-controller creates commerce facet sub-controllers from the Commerce API search or
 * product listing response.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by this sub-controller to
 * properly render facets in their application.
 *
 * @group Sub-controllers
 * @category FacetGenerator
 */
export interface FacetGenerator extends Controller {
  /**
   * The ordered list of facet IDs for which sub-controllers will be created and returned when the `facets` getter is called.
   */
  state: string[];

  /**
   * The facet sub-controllers created by the facet generator.
   * Array of [RegularFacet](./regular-facet), [DateRangeFacet](./date-range-facet), [NumericFacet](./numeric-facet), and [CategoryFacet](./category-facet).
   */
  facets: GeneratedFacetControllers;

  /**
   * Deselects all values in all facets.
   * */
  deselectAll(): void;
}

/**
 * Represents the state of a facet generator.
 */
export type FacetGeneratorState = FacetGenerator['state'];

/**
 * Represents an array of generated facet sub-controllers.
 * Each sub-controller is mapped to a specific facet type.
 *
 * @group Sub-controllers
 * @category FacetGenerator
 */
export type GeneratedFacetControllers = Array<
  MappedGeneratedFacetController[FacetType]
>;

/**
 * @group Sub-controllers
 * @category FacetGenerator
 */
export type MappedGeneratedFacetController = {
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

export type CommerceSearchableFacetBuilder<
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
  buildRegularFacet: CommerceFacetBuilder<RegularFacet>;
  buildNumericFacet: CommerceFacetBuilder<NumericFacet>;
  buildDateFacet: CommerceFacetBuilder<DateFacet>;
  buildCategoryFacet: CommerceFacetBuilder<CategoryFacet>;
  fetchProductsActionCreator: FetchProductsActionCreator;
}

/**
 * @internal
 *
 * Creates a `FacetGenerator` sub-controller.
 *
 * @param engine - The commerce engine.
 * @param options - The facet generator options used internally.
 * @returns A `FacetGenerator` sub-controller.
 */
export function buildFacetGenerator(
  engine: CommerceEngine,
  options: FacetGeneratorOptions
): FacetGenerator {
  if (!loadCommerceFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

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

    deselectAll: () => {
      dispatch(clearAllCoreFacets());
      dispatch(options.fetchProductsActionCreator());
    },

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
