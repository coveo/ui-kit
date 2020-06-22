import {Facet, FacetOptions} from './headless-facet';
import {MockEngine, buildMockEngine} from '../../../test/mock-engine';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {SearchPageState} from '../../../state';
import {createMockState} from '../../../test/mock-state';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetValue} from '../../../test/mock-facet-value';

describe('facet', () => {
  let options: Required<FacetOptions>;
  let state: SearchPageState;
  let engine: MockEngine;
  let facet: Facet;

  function initEngine() {
    engine = buildMockEngine({state});
  }

  function initFacet() {
    facet = new Facet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId: '',
      field: '',
    };

    state = createMockState();

    initEngine();
    initFacet();
  });

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  it('registers a facet with the passed id and field', () => {
    options = {
      facetId: '1',
      field: 'author',
    };
    initFacet();

    const action = registerFacet(options);

    expect(engine.actions).toContainEqual(action);
  });

  it('when the search response is empty, the facet #state.values is an empty array', () => {
    expect(state.search.response.facets).toEqual([]);
    expect(facet.state.values).toEqual([]);
  });

  it('when the search response has a facet, the facet #state.values contains the same values', () => {
    const id = '1';
    options.facetId = id;

    const values = [buildMockFacetValue()];
    const facetResponse = buildMockFacetResponse({facetId: id, values});
    state.search.response.facets = [facetResponse];

    initEngine();
    initFacet();

    expect(facet.state.values).toBe(values);
  });
});
