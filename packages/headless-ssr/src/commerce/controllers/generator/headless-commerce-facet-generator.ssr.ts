import type {BaseFacetSearchResult} from '@coveo/headless/ssr-internal';
import type {CategoryFacetSearchResult} from '@coveo/headless/commerce';
import type {CommerceEngine} from '@coveo/headless/commerce';
import {stateKey} from '@coveo/headless/ssr-internal';
import type {CategoryFacet, CategoryFacetState} from '@coveo/headless/commerce';
import {getCategoryFacetState} from '@coveo/headless/ssr-internal';
import type {DateFacet, DateFacetState, DateFacetValue} from '@coveo/headless/commerce';
import {getDateFacetState} from '@coveo/headless/ssr-internal';
import type {
  FacetGenerator as CSRFacetGenerator,
  MappedGeneratedFacetController,
} from '@coveo/headless/commerce';
import type {CategoryFacetValue, FacetType} from '@coveo/headless/commerce';
import type {CoreCommerceFacet} from '@coveo/headless/ssr-internal';
import {getCoreFacetState} from '@coveo/headless/ssr-internal';
import type {NumericFacet, NumericFacetState, NumericFacetValue} from '@coveo/headless/commerce';
import {getNumericFacetState} from '@coveo/headless/ssr-internal';
import type {RegularFacet, RegularFacetState} from '@coveo/headless/commerce';
import {getRegularFacetState} from '@coveo/headless/ssr-internal';
import {
  productListingFacetResponseSelector as listingFacetResponseSelector,
  productListingIsFacetLoadingResponseSelector as listingIsFacetLoadingResponseSelector,
} from '@coveo/headless/ssr-internal';
import {buildProductListing} from '@coveo/headless/commerce';
import {
  commerceSearchFacetResponseSelector as searchFacetResponseSelector,
  commerceSearchIsFacetLoadingResponseSelector as searchIsFacetLoadingResponseSelector,
} from '@coveo/headless/ssr-internal';
import {buildSearch} from '@coveo/headless/commerce';
import {facetRequestSelector} from '@coveo/headless/ssr-internal';
import type {CategoryFacetRequest} from '@coveo/headless/ssr-internal';
import type {AnyFacetResponse} from '@coveo/headless/ssr-internal';
import type {RegularFacetValue} from '@coveo/headless/commerce';
import {manualNumericFacetSelector} from '@coveo/headless/ssr-internal';
import {manualNumericFacetReducer as manualNumericFacetSet} from '@coveo/headless/ssr-internal';
import {categoryFacetSearchStateSelector} from '@coveo/headless/ssr-internal';
import {specificFacetSearchStateSelector} from '@coveo/headless/ssr-internal';
import type {ManualRangeSection} from '@coveo/headless/ssr-internal';
import {loadReducerError} from '@coveo/headless/ssr-internal';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  BaseFacetSearchResult,
  CategoryFacet,
  CategoryFacetSearchResult,
  CategoryFacetState,
  CategoryFacetValue,
  CoreCommerceFacet,
  DateFacet,
  DateFacetState,
  DateFacetValue,
  MappedGeneratedFacetController,
  NumericFacet,
  NumericFacetState,
  NumericFacetValue,
  RegularFacet,
  RegularFacetState,
  RegularFacetValue,
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
export interface FacetGenerator extends Omit<CSRFacetGenerator, 'state' | 'facets'> {
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

    getFacetController: <T extends FacetType>(facetId: string, facetType: T) => {
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
              facetRequestSelector(getEngineState(), facetId) as CategoryFacetRequest
            );
          case 'dateRange':
            return getDateFacetState(createFacetState(facetResponseSelector) as DateFacetState);

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
