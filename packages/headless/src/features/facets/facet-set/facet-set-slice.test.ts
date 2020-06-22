import {
  facetSetReducer,
  FacetSetState,
  getFacetSetInitialState,
  buildFacetRequest,
} from './facet-set-slice';
import {registerFacet, FacetOptions} from './facet-set-actions';

describe('facet-set slice', () => {
  let state: FacetSetState;

  function buildOptions(config: Partial<FacetOptions>): FacetOptions {
    return {
      facetId: '',
      field: '',
      ...config,
    };
  }

  beforeEach(() => {
    state = getFacetSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('registers a facet request with the passed field and expected default values', () => {
    const facetId = '1';
    const options = buildOptions({facetId, field: 'author'});
    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);

    const expectedFacet = {
      facetId,
      field: options.field,
      type: 'specific',
      currentValues: [],
      delimitingCharacter: '>',
      filterFacetCount: true,
      freezeCurrentValues: false,
      injectionDepth: 1000,
      isFieldExpanded: false,
      numberOfValues: 8,
      preventAutoSelect: false,
      sortCriteria: 'score',
    };

    expect(finalState[facetId]).toEqual(expectedFacet);
  });

  it('if a facet request is already registered for an id, it does not overwrite the request', () => {
    const id = '1';
    state[id] = buildFacetRequest();

    const options = buildOptions({facetId: id, field: 'author'});
    const action = registerFacet(options);
    const finalState = facetSetReducer(state, action);

    expect(finalState[id].field).toBe(state[id].field);
  });
});
