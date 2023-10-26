import {facetsReducer as commerceFacets} from '../../../../features/commerce/facets/facets-slice';
import {facetSetReducer as facetSet} from '../../../../features/facets/facet-set/facet-set-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildMockFacetOptions} from '../../../../test/mock-facet-options';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice';
import {buildFacet} from './headless-product-listing-facet';
import {
  buildFacetGenerator,
  FacetGenerator,
} from './headless-product-listing-facet-generator';

describe('FacetGenerator', () => {
  let engine: MockCommerceEngine;
  let facetGenerator: FacetGenerator;

  function initFacetGenerator() {
    engine = buildMockCommerceEngine();

    facetGenerator = buildFacetGenerator(engine);
  }

  beforeEach(() => {
    initFacetGenerator();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      facetSet,
      commerceFacets,
    });
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('should return facet controllers', () => {
    const facet = {
      facetId: 'some-facet-id',
      field: 'some_field',
    };
    const engine = buildMockCommerceEngine({
      state: {
        ...buildMockCommerceState(),
        commerceFacets: {
          facets: [buildMockFacetResponse(facet)],
        },
        facetSet: {
          [facet.facetId]: buildMockFacetSlice({
            request: buildMockFacetRequest(facet),
          }),
        },
        facetOptions: buildMockFacetOptions({
          facets: {
            [facet.facetId]: {enabled: true},
          },
        }),
      },
    });
    facetGenerator = buildFacetGenerator(engine);

    expect(facetGenerator.state.facets.length).toEqual(1);
    expect(facetGenerator.state.facets[0].state).toEqual(
      buildFacet(engine, {options: facet}).state
    );
  });
});
