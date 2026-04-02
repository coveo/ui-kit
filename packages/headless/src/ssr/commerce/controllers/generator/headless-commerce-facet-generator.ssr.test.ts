import type {GeneratedFacetControllers} from '../../../../controllers/commerce/core/facets/generator/headless-commerce-facet-generator.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import type {AnyFacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response.js';
import type {CommerceAppState} from '../../../../state/commerce-app-state.js';
import {buildMockCategoryFacetSearch} from '../../../../test/mock-category-facet-search.js';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request.js';
import {
  buildMockCategoryFacetResponse,
  buildMockCommerceDateFacetResponse,
  buildMockCommerceLocationFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceRegularFacetResponse,
} from '../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockSSRCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search.js';
import {SolutionType} from '../../types/controller-constants.js';
import {
  buildFacetGenerator,
  type FacetGenerator,
  type FacetGeneratorOptions,
  type FacetType,
} from './headless-commerce-facet-generator.ssr.js';

describe('SSR FacetGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: FacetGeneratorOptions;
  let facetGenerator: FacetGenerator;
  let facetsInEngineState: {facetId: string; type: FacetType}[];

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockSSRCommerceEngine({...preloadedState});
  }

  function initCommerceFacetGenerator() {
    facetGenerator = buildFacetGenerator(engine, options);
  }

  function setFacetState(config = facetsInEngineState) {
    for (const facet of config) {
      const {facetId, type} = facet;
      state.facetOrder.push(facetId);
      let response: AnyFacetResponse;
      switch (type) {
        case 'dateRange':
          response = buildMockCommerceDateFacetResponse({facetId, type});
          break;
        case 'hierarchical':
          response = buildMockCategoryFacetResponse({facetId, type});
          break;
        case 'numericalRange':
          response = buildMockCommerceNumericFacetResponse({facetId, type});
          break;
        case 'location':
          response = buildMockCommerceLocationFacetResponse({facetId, type});
          break;
        default:
          response = buildMockCommerceRegularFacetResponse({facetId, type});
      }
      if (options.props.solutionType === SolutionType.listing) {
        state.productListing.facets.push(response);
      } else {
        state.commerceSearch.facets.push(response);
      }

      state.commerceFacetSet[facet.facetId] = {
        request: buildMockCommerceFacetRequest({
          facetId: facet.facetId,
          type: facet.type,
        }),
      };
      if (type === 'regular') {
        state.facetSearchSet[facet.facetId] = buildMockFacetSearch();
      } else if (type === 'hierarchical') {
        state.categoryFacetSearchSet[facet.facetId] =
          buildMockCategoryFacetSearch();
      }
    }
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });
  describe.each([
    {
      solutionType: SolutionType.listing,
      buildGeneratedCSRFacetControllersFunction: () =>
        buildProductListing(engine).facetGenerator().facets,
    },
    {
      solutionType: SolutionType.search,
      buildGeneratedCSRFacetControllersFunction: () =>
        buildSearch(engine).facetGenerator().facets,
    },
  ])(
    'when solutionType is $solutionType',
    ({solutionType, buildGeneratedCSRFacetControllersFunction}) => {
      let generatedCSRFacetControllers: GeneratedFacetControllers;
      beforeEach(() => {
        options = {props: {solutionType}};
        facetsInEngineState = [
          {
            facetId: 'category-facet',
            type: 'hierarchical',
          },
          {
            facetId: 'date-facet',
            type: 'dateRange',
          },
          {
            facetId: 'numeric-facet',
            type: 'numericalRange',
          },
          {
            facetId: 'regular-facet',
            type: 'regular',
          },
          {
            facetId: 'location-facet',
            type: 'location',
          },
        ];
        state = buildMockCommerceState();
        setFacetState(facetsInEngineState);
        initEngine(state);
        initCommerceFacetGenerator();

        generatedCSRFacetControllers =
          buildGeneratedCSRFacetControllersFunction();
      });

      it('initialized', () => {
        expect(facetGenerator).toBeTruthy();
      });
      it('#state is an array containing the state of each facet', () => {
        expect(facetGenerator.state.length).toBe(5);
        expect(
          facetGenerator.state.map((facet) => ({
            facetId: facet.facetId,
            type: facet.type,
          }))
        ).toEqual(facetsInEngineState);
      });

      it('#getFacetController returns facet controller for the given facet id and type', () => {
        for (const facetInEngineState of facetsInEngineState) {
          const {facetId, type} = facetInEngineState;
          const generatedSSRFacetController = facetGenerator.getFacetController(
            facetId,
            type
          );
          const generatedCSRFacetController = generatedCSRFacetControllers.find(
            (controller) => controller.state.facetId === facetId
          );
          expect(generatedSSRFacetController).toBeTruthy();
          expect(generatedSSRFacetController?.type).toBe(
            generatedCSRFacetController?.type
          );
          expect(generatedSSRFacetController?.state).toEqual(
            generatedCSRFacetController?.state
          );
        }
      });
    }
  );
});
