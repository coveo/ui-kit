import type {BaseFacetSearchResult} from '../../../../api/search/facet-search/base/base-facet-search-response.js';
import type {CategoryFacetSearchResult} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import type {
  CategoryFacet,
  CategoryFacetState,
} from '../../../../controllers/commerce/core/facets/category/headless-commerce-category-facet.js';
import {getCategoryFacetState} from '../../../../controllers/commerce/core/facets/category/headless-commerce-category-facet.js';
import type {
  DateFacet,
  DateFacetState,
  DateFacetValue,
} from '../../../../controllers/commerce/core/facets/date/headless-commerce-date-facet.js';
import {getDateFacetState} from '../../../../controllers/commerce/core/facets/date/headless-commerce-date-facet.js';
import type {
  FacetGenerator as CSRFacetGenerator,
  MappedGeneratedFacetController,
} from '../../../../controllers/commerce/core/facets/generator/headless-commerce-facet-generator.js';
import type {
  CategoryFacetValue,
  CoreCommerceFacet,
  FacetType,
} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet.js';
import {getCoreFacetState} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet.js';
import type {
  LocationFacet,
  LocationFacetState,
} from '../../../../controllers/commerce/core/facets/location/headless-commerce-location-facet.js';
import {getLocationFacetState} from '../../../../controllers/commerce/core/facets/location/headless-commerce-location-facet.js';
import type {
  NumericFacet,
  NumericFacetState,
  NumericFacetValue,
} from '../../../../controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet.js';
import {getNumericFacetState} from '../../../../controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet.js';
import type {
  RegularFacet,
  RegularFacetState,
} from '../../../../controllers/commerce/core/facets/regular/headless-commerce-regular-facet.js';
import {getRegularFacetState} from '../../../../controllers/commerce/core/facets/regular/headless-commerce-regular-facet.js';
import {
  facetResponseSelector as listingFacetResponseSelector,
  isFacetLoadingResponseSelector as listingIsFacetLoadingResponseSelector,
} from '../../../../controllers/commerce/product-listing/facets/headless-product-listing-facet-options.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {
  facetResponseSelector as searchFacetResponseSelector,
  isFacetLoadingResponseSelector as searchIsFacetLoadingResponseSelector,
} from '../../../../controllers/commerce/search/facets/headless-search-facet-options.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import {facetRequestSelector} from '../../../../features/commerce/facets/facet-set/facet-set-selector.js';
import type {CategoryFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request.js';
import type {
  AnyFacetResponse,
  LocationFacetValue,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {manualNumericFacetSelector} from '../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-selectors.js';
import {manualNumericFacetReducer as manualNumericFacetSet} from '../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice.js';
import {categoryFacetSearchStateSelector} from '../../../../features/facets/facet-search-set/category/category-facet-search-state-selector.js';
import {specificFacetSearchStateSelector} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-state-selector.js';
import type {ManualRangeSection} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  BaseFacetSearchResult,
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacetSearchResult,
  CoreCommerceFacet,
  DateFacet,
  DateFacetValue,
  DateFacetState,
  NumericFacet,
  NumericFacetValue,
  NumericFacetState,
  RegularFacet,
  RegularFacetState,
  RegularFacetValue,
  LocationFacet,
  LocationFacetState,
  LocationFacetValue,
  MappedGeneratedFacetController,
};

export type FacetGeneratorState = MappedFacetStates;

export type MappedFacetStates = Array<MappedFacetState[FacetType]>;

export type {FacetType};

export type MappedFacetState = {
  [T in FacetType]: T extends 'numericalRange'
    ? NumericFacetState
    : T extends 'regular'
      ? RegularFacetState
      : T extends 'dateRange'
        ? DateFacetState
        : T extends 'hierarchical'
          ? CategoryFacetState
          : T extends 'location'
            ? LocationFacetState
            : never;
};

export type FacetGeneratorDefinition =
  SearchAndListingControllerDefinitionWithoutProps<FacetGenerator>;

/**
 * @group Definers
 */
export function defineFacetGenerator(): FacetGeneratorDefinition {
  return {
    listing: true,
    search: true,
    build: (engine, solutionType) =>
      buildFacetGenerator(engine, {props: {solutionType: solutionType!}}),
  };
}

/**
 * The `FacetGenerator` headless sub-controller creates commerce facet sub-controllers from the Commerce API search or
 * product listing response.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by this sub-controller to
 * properly render facets in their application.
 */
export interface FacetGenerator
  extends Omit<CSRFacetGenerator, 'state' | 'facets'> {
  /**
   * The state of each every facet returned by the Commerce API.
   *
   * In a server-side rendering (SSR) scenario, use this state to render the facet UI components before the
   * facet controller is hydrated on the client side.
   *
   * Once the facet generator controller has been hydrated, use the `getFacetController` method to retrieve
   * the individual facet controllers and subscribe to their respective states.
   */
  state: FacetGeneratorState;

  /**
   * Builds a facet controller for the specified facet ID.
   *
   * @param facetId The unique identifier of the facet.
   * @param facetType The type of facet to build.
   * @returns A facet controller of the specified type, or `undefined` if the facet does not exist in the state.
   */
  getFacetController: <T extends FacetType>(
    facetId: string,
    facetType: T
  ) => MappedGeneratedFacetController[T] | undefined;
}

export interface FacetGeneratorOptions {
  props: FacetGeneratorProps;
}

interface FacetGeneratorProps {
  solutionType: SolutionType;
}

/**
 * Creates a `FacetGenerator` sub-controller for server-side rendering purposes (SSR).
 *
 * @param engine - The SSR commerce engine.
 * @param options - The facet generator options used internally.
 * @returns A `FacetGenerator` sub-controller.
 */
export function buildFacetGenerator(
  engine: CommerceEngine,
  options: FacetGeneratorOptions
): FacetGenerator {
  if (!loadFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const getEngineState = () => engine[stateKey];
  const solutionType = options.props.solutionType;

  const getFacetResponseSelector = (facetId: string) => {
    return solutionType === SolutionType.listing
      ? listingFacetResponseSelector(getEngineState(), facetId)
      : searchFacetResponseSelector(getEngineState(), facetId);
  };

  const isFacetLoadingResponseSelector =
    solutionType === SolutionType.listing
      ? listingIsFacetLoadingResponseSelector(getEngineState())
      : searchIsFacetLoadingResponseSelector(getEngineState());

  const createFacetState = (facetResponseSelector: AnyFacetResponse) => {
    const facetId = facetResponseSelector.facetId;
    return getCoreFacetState(
      facetId,
      facetRequestSelector(getEngineState(), facetId),
      facetResponseSelector,
      isFacetLoadingResponseSelector
    );
  };

  const baseController =
    solutionType === SolutionType.listing
      ? buildProductListing(engine).facetGenerator()
      : buildSearch(engine).facetGenerator();

  const {state: _state, ...restOfBaseController} = baseController;

  return {
    ...restOfBaseController,

    getFacetController: <T extends FacetType>(
      facetId: string,
      facetType: T
    ) => {
      const controller = baseController.facets.find(
        (f) => f.state.facetId === facetId && f.type === facetType
      );

      return controller as MappedGeneratedFacetController[T] | undefined;
    },

    get state() {
      const facetResponseSelectors = baseController.state
        .map(getFacetResponseSelector)
        .filter((selector) => selector !== undefined);

      return facetResponseSelectors.map((selector) => {
        const facetResponseSelector = selector!;
        const facetId = facetResponseSelector.facetId;
        switch (facetResponseSelector.type) {
          case 'hierarchical':
            return getCategoryFacetState(
              createFacetState(facetResponseSelector) as CategoryFacetState,
              categoryFacetSearchStateSelector(getEngineState(), facetId),
              facetRequestSelector(
                getEngineState(),
                facetId
              ) as CategoryFacetRequest
            );
          case 'dateRange':
            return getDateFacetState(
              createFacetState(facetResponseSelector) as DateFacetState
            );

          case 'numericalRange':
            return getNumericFacetState(
              createFacetState(facetResponseSelector) as NumericFacetState,
              facetResponseSelector,
              manualNumericFacetSelector(getEngineState(), facetId)
            );
          case 'regular':
            return getRegularFacetState(
              createFacetState(facetResponseSelector) as RegularFacetState,
              specificFacetSearchStateSelector(getEngineState(), facetId)
            );
          case 'location':
            return getLocationFacetState(
              createFacetState(facetResponseSelector) as LocationFacetState
            );
        }
      });
    },
  };
}

function loadFacetGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<ManualRangeSection> {
  engine.addReducers({manualNumericFacetSet});
  return true;
}
