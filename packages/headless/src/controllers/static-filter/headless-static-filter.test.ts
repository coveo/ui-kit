import {executeSearch} from '../../features/search/search-actions.js';
import {
  deselectAllStaticFilterValues,
  registerStaticFilter,
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions.js';
import {staticFilterSetReducer as staticFilterSet} from '../../features/static-filter-set/static-filter-set-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice.js';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value.js';
import {
  buildStaticFilter,
  type StaticFilter,
  type StaticFilterOptions,
} from './headless-static-filter.js';

vi.mock('../../features/search/search-actions');
vi.mock('../../features/static-filter-set/static-filter-set-actions');

describe('Static Filter', () => {
  let engine: MockedSearchEngine;
  let filter: StaticFilter;
  let options: StaticFilterOptions;

  function initStaticFilter() {
    filter = buildStaticFilter(engine, {options});
  }

  beforeEach(() => {
    vi.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
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

    expect(registerStaticFilter).toHaveBeenCalledWith({id, values});
  });

  it('when #id option has an invalid type, it throws', () => {
    options.id = true as unknown as string;
    expect(() => initStaticFilter()).toThrow(
      'Check the options of buildStaticFilter'
    );
  });
  describe('#toggleSelect', () => {
    it('dispatches #toggleSelectStaticFilterValue', () => {
      const value = buildMockStaticFilterValue();
      filter.toggleSelect(value);
      expect(toggleSelectStaticFilterValue).toHaveBeenCalledWith({
        id: options.id,
        value,
      });
    });

    it('dispatches #executeSearch', () => {
      const value = buildMockStaticFilterValue();
      filter.toggleSelect(value);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches #toggleExcludeStaticFilterValue', () => {
      const value = buildMockStaticFilterValue();
      filter.toggleExclude(value);
      expect(toggleExcludeStaticFilterValue).toHaveBeenCalledWith({
        id: options.id,
        value,
      });
    });

    it('dispatches #executeSearch', () => {
      const value = buildMockStaticFilterValue();
      filter.toggleExclude(value);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllStaticFilterValues', () => {
      filter.deselectAll();
      expect(deselectAllStaticFilterValues).toHaveBeenCalledWith(options.id);
    });

    it('dispatches #executeSearch', () => {
      filter.deselectAll();
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#toggleSingleSelect', () => {
    it('with an idle value, it deselects all values and toggle selects the value', () => {
      const {id} = options;
      const value = buildMockStaticFilterValue({state: 'idle'});
      filter.toggleSingleSelect(value);

      expect(deselectAllStaticFilterValues).toHaveBeenCalledWith(id);
      expect(toggleSelectStaticFilterValue).toHaveBeenCalledWith({id, value});
    });

    it('with an active value, it only toggle selects the value', () => {
      const {id} = options;
      const value = buildMockStaticFilterValue({state: 'selected'});
      filter.toggleSingleSelect(value);

      expect(deselectAllStaticFilterValues).not.toHaveBeenCalledWith(id);
      expect(toggleSelectStaticFilterValue).toHaveBeenCalledWith({id, value});
    });

    it('dispatches #executeSearch', () => {
      const value = buildMockStaticFilterValue();
      filter.toggleSingleSelect(value);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#toggleSingleExcluded', () => {
    it('with an idle value, it deselects all values and toggle excludes the value', () => {
      const {id} = options;
      const value = buildMockStaticFilterValue({state: 'idle'});
      filter.toggleSingleExclude(value);

      expect(deselectAllStaticFilterValues).toHaveBeenCalledWith(id);
      expect(toggleExcludeStaticFilterValue).toHaveBeenCalledWith({id, value});
    });

    it('with a selected value, it only toggle excludes the value', () => {
      const {id} = options;
      const value = buildMockStaticFilterValue({state: 'selected'});
      filter.toggleSingleExclude(value);

      expect(deselectAllStaticFilterValues).not.toHaveBeenCalledWith(id);
      expect(toggleExcludeStaticFilterValue).toHaveBeenCalledWith({id, value});
    });

    it('with an excluded value, it only toggle excludes the value', () => {
      const {id} = options;
      const value = buildMockStaticFilterValue({state: 'excluded'});
      filter.toggleSingleExclude(value);

      expect(deselectAllStaticFilterValues).not.toHaveBeenCalledWith(id);
      expect(toggleExcludeStaticFilterValue).toHaveBeenCalledWith({id, value});
    });

    it('dispatches #executeSearch', () => {
      const value = buildMockStaticFilterValue();
      filter.toggleSingleSelect(value);

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#isValueSelected', () => {
    it('when the value state is selected, it returns true', () => {
      const value = buildMockStaticFilterValue({state: 'selected'});
      expect(filter.isValueSelected(value)).toBe(true);
    });

    it('when the value state is excluded, it returns false', () => {
      const value = buildMockStaticFilterValue({state: 'excluded'});
      expect(filter.isValueSelected(value)).toBe(false);
    });

    it('when the value state is idle, it returns false', () => {
      const value = buildMockStaticFilterValue({state: 'idle'});
      expect(filter.isValueSelected(value)).toBe(false);
    });
  });

  describe('#isValueExcluded', () => {
    it('when the value state is excluded, it returns true', () => {
      const value = buildMockStaticFilterValue({state: 'excluded'});
      expect(filter.isValueExcluded(value)).toBe(true);
    });

    it('when the value state is selected, it returns false', () => {
      const value = buildMockStaticFilterValue({state: 'selected'});
      expect(filter.isValueExcluded(value)).toBe(false);
    });

    it('when the value state is idle, it returns false', () => {
      const value = buildMockStaticFilterValue({state: 'idle'});
      expect(filter.isValueExcluded(value)).toBe(false);
    });
  });

  it('#state.id exposes the id', () => {
    expect(filter.state.id).toBe(options.id);
  });

  it('#state.values exposes the values from state', () => {
    const id = options.id;
    const value = buildMockStaticFilterValue({expression: 'a'});
    const slice = buildMockStaticFilterSlice({values: [value]});
    engine.state.staticFilterSet = {[id]: slice};

    expect(filter.state.values).toEqual([value]);
  });

  describe('#state.hasActiveValues', () => {
    it('when at least one value is selected, it is true', () => {
      const id = options.id;
      const value = buildMockStaticFilterValue({state: 'selected'});
      const slice = buildMockStaticFilterSlice({values: [value]});
      engine.state.staticFilterSet = {[id]: slice};

      expect(filter.state.hasActiveValues).toBe(true);
    });

    it('when at least one value is excluded, it is true', () => {
      const id = options.id;
      const value = buildMockStaticFilterValue({state: 'excluded'});
      const slice = buildMockStaticFilterSlice({values: [value]});
      engine.state.staticFilterSet = {[id]: slice};

      expect(filter.state.hasActiveValues).toBe(true);
    });

    it('when at there are no selected values, it is false', () => {
      const id = options.id;
      const slice = buildMockStaticFilterSlice({values: []});
      engine.state.staticFilterSet = {[id]: slice};

      expect(filter.state.hasActiveValues).toBe(false);
    });
  });
});
