import {configuration} from '../../../app/common-reducers.js';
import {setOptions} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions.js';
import {NUMBER_OF_VALUE_DEFAULT} from '../../../features/facets/automatic-facet-set/automatic-facet-set-constants.js';
import {automaticFacetSetReducer as automaticFacetSet} from '../../../features/facets/automatic-facet-set/automatic-facet-set-slice.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  type AutomaticFacetGenerator,
  type AutomaticFacetGeneratorOptions,
  type AutomaticFacetGeneratorProps,
  buildAutomaticFacetGenerator,
} from './headless-automatic-facet-generator.js';

vi.mock(
  '../../../features/facets/automatic-facet-set/automatic-facet-set-actions'
);

describe('automatic facets', () => {
  let engine: MockedSearchEngine;
  let automaticFacets: AutomaticFacetGenerator;
  let props: AutomaticFacetGeneratorProps;

  function setup(config: Partial<AutomaticFacetGeneratorOptions> = {}) {
    props = {
      options: {
        desiredCount: 5,
        numberOfValues: NUMBER_OF_VALUE_DEFAULT,
        ...config,
      },
    };
    engine = buildMockSearchEngine(createMockState());
    automaticFacets = buildAutomaticFacetGenerator(engine, props);
  }
  beforeEach(() => {
    vi.resetAllMocks();
    setup();
  });

  it('should add the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      automaticFacetSet,
      configuration,
      search,
    });
  });

  describe('#setOptions', () => {
    it('should dispatch #setOptions with valid options', () => {
      expect(setOptions).toHaveBeenCalledWith(props.options);
    });
  });

  it('should dispatch #setOptions', () => {
    expect(setOptions).toHaveBeenCalledWith(props.options);
  });

  it('should return automatic facets as empty array if the response is empty', () => {
    expect(automaticFacets.state.automaticFacets).toEqual([]);
  });
});
