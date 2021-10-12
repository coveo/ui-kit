import {staticFilterSet} from '../../app/reducers';
import {registerStaticFilter} from '../../features/static-filter-set/static-filter-set-actions';
import {buildMockSearchAppEngine, MockSearchEngine} from '../../test';
import {
  buildStaticFilter,
  StaticFilter,
  StaticFilterOptions,
} from './headless-static-filter';

describe('Static Filter', () => {
  let engine: MockSearchEngine;
  let filter: StaticFilter;
  let options: StaticFilterOptions;

  function initStaticFilter() {
    filter = buildStaticFilter(engine, {options});
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    options = {
      id: 'a',
      values: [],
    };

    initStaticFilter();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({staticFilterSet});
  });

  it('is subscribable', () => {
    expect(filter.subscribe).toBeTruthy();
  });

  it('registers the static filter in state', () => {
    const {id, values} = options;
    const action = registerStaticFilter({id, values});
    expect(engine.actions).toContainEqual(action);
  });

  it('when #id option has an invalid type, it throws', () => {
    options.id = true as unknown as string;
    expect(() => initStaticFilter()).toThrow(
      'Check the options of buildStaticFilter'
    );
  });
});
