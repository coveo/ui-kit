import {configuration} from '../../../app/common-reducers';
import {setOptions} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {
  DESIRED_COUNT_MAXIMUM,
  DESIRED_COUNT_MINIMUM,
  NUMBER_OF_VALUE_DEFAULT,
  NUMBER_OF_VALUE_MINIMUM,
} from '../../../features/facets/automatic-facet-set/automatic-facet-set-constants';
import {automaticFacetSetReducer as automaticFacetSet} from '../../../features/facets/automatic-facet-set/automatic-facet-set-slice';
import {searchReducer as search} from '../../../features/search/search-slice';
import {buildMockSearchAppEngine} from '../../../test/mock-engine';
import {MockSearchEngine} from '../../../test/mock-engine';
import {
  AutomaticFacetGeneratorProps,
  AutomaticFacetGenerator,
  buildAutomaticFacetGenerator,
  AutomaticFacetGeneratorOptions,
} from './headless-automatic-facet-generator';

describe('automatic facets', () => {
  let engine: MockSearchEngine;
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
    engine = buildMockSearchAppEngine();
    automaticFacets = buildAutomaticFacetGenerator(engine, props);
  }
  beforeEach(() => {
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
      expect(engine.actions).toContainEqual(setOptions(props.options));
    });

    it(`should not dispatch #setOptions if desiredCount is lower than ${DESIRED_COUNT_MINIMUM}`, () => {
      setup({desiredCount: 0});
      expect(engine.actions).toEqual([]);
    });

    it(`should not dispatch #setOptions if desiredCount is higher than ${DESIRED_COUNT_MAXIMUM}`, () => {
      setup({desiredCount: 21});
      expect(engine.actions).toEqual([]);
    });

    it(`should not dispatch #setOptions if numberOfValue is lower than ${NUMBER_OF_VALUE_MINIMUM}`, () => {
      setup({numberOfValues: 0});
      expect(engine.actions).toEqual([]);
    });
  });

  it('should dispatch #setOptions', () => {
    expect(engine.actions).toContainEqual(setOptions(props.options));
  });

  it('should return automatic facets as empty array if the response is empty', () => {
    expect(automaticFacets.state.automaticFacets).toEqual([]);
  });
});
