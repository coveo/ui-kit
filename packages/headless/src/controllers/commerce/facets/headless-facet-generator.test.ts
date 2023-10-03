import {facetsReducer as commerceFacets} from '../../../features/commerce/facets/facets-slice';
import {facetOptionsReducer as facetOptions} from '../../../features/facet-options/facet-options-slice';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../test';
import {buildMockCommerceFacetResponse} from '../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {buildMockFacetOptions} from '../../../test/mock-facet-options';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {buildFacet} from './headless-facet';
import {buildFacetGenerator, FacetGenerator} from './headless-facet-generator';

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
      facetOptions,
      commerceFacets,
    });
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  it('should return facet controllers', () => {
    // eslint-disable-next-line @cspell/spellchecker
    // TODO CAPI-90, CAPI-91: Add test cases that ensure proper facet controllers are created from the facet.type
    const facet = {
      facetId: 'some-facet-id',
      field: 'some_field',
    };
    const engine = buildMockCommerceEngine({
      state: {
        ...buildMockCommerceState(),
        commerceFacets: {
          facets: [buildMockCommerceFacetResponse(facet)],
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
