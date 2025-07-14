import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice.js';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value.js';
import {deselectAllBreadcrumbs} from '../breadcrumb/breadcrumb-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {
  deselectAllStaticFilterValues,
  registerStaticFilter,
  toggleSelectStaticFilterValue,
} from './static-filter-set-actions.js';
import {staticFilterSetReducer} from './static-filter-set-slice.js';
import type {
  StaticFilterValue,
  StaticFilterValueState,
} from './static-filter-set-state.js';

describe('static-filter-set slice', () => {
  it('initializes correctly', () => {
    const state = staticFilterSetReducer(undefined, {type: ''});
    expect(state).toEqual({});
  });

  describe('#registerStaticFilter', () => {
    it('when id does not exist, it adds it to the set', () => {
      const filter = buildMockStaticFilterSlice({id: 'a'});
      const action = registerStaticFilter(filter);
      const state = staticFilterSetReducer({}, action);

      expect(state).toEqual({a: filter});
    });

    it('when the id exists, it does not overwrite the filter in the set', () => {
      const id = 'a';
      const value = buildMockStaticFilterValue();
      const filterA = buildMockStaticFilterSlice({id, values: [value]});
      const filterB = buildMockStaticFilterSlice({id});

      const action = registerStaticFilter(filterB);
      const state = staticFilterSetReducer({[id]: filterA}, action);

      expect(state).toEqual({a: filterA});
    });

    it('when the id is an empty string, the action detects an error', () => {
      const action = registerStaticFilter({id: '', values: []});
      expect('error' in action).toBe(true);
    });

    it('when the #caption property in the #values array has the wrong type, the action detects an error', () => {
      const value = buildMockStaticFilterValue({
        caption: 1 as unknown as string,
      });
      const action = registerStaticFilter({id: 'a', values: [value]});

      expect('error' in action).toBe(true);
    });

    it('when the #expression property in the #values array has the wrong type, the action detects an error', () => {
      const value = buildMockStaticFilterValue({
        expression: 1 as unknown as string,
      });
      const action = registerStaticFilter({id: 'a', values: [value]});

      expect('error' in action).toBe(true);
    });

    it('when the #state property in the #values array has the wrong type, the action detects an error', () => {
      const value = buildMockStaticFilterValue({
        state: 'idle1' as unknown as StaticFilterValueState,
      });
      const action = registerStaticFilter({id: 'a', values: [value]});

      expect('error' in action).toBe(true);
    });
  });

  describe('#toggleSelectStaticFilterValue', () => {
    it('when the value in state is idle, it selects it', () => {
      const id = 'a';
      const value = buildMockStaticFilterValue({state: 'idle'});
      const filter = buildMockStaticFilterSlice({values: [value]});
      const action = toggleSelectStaticFilterValue({id, value});

      const state = staticFilterSetReducer({[id]: filter}, action);
      expect(state[id].values).toContainEqual({...value, state: 'selected'});
    });

    it('when the value in state is selected, it sets it to idle', () => {
      const id = 'a';
      const value = buildMockStaticFilterValue({state: 'selected'});
      const filter = buildMockStaticFilterSlice({values: [value]});
      const action = toggleSelectStaticFilterValue({id, value});

      const state = staticFilterSetReducer({[id]: filter}, action);
      expect(state[id].values).toContainEqual({...value, state: 'idle'});
    });

    it('when the id does not exist, it does not throw', () => {
      const id = 'a';
      const value = buildMockStaticFilterValue({state: 'selected'});
      const action = toggleSelectStaticFilterValue({id, value});

      expect(() => staticFilterSetReducer({}, action)).not.toThrow();
    });

    it('when the id is an empty string, the action detects an error', () => {
      const value = buildMockStaticFilterValue();
      const action = toggleSelectStaticFilterValue({id: '', value});
      expect('error' in action).toBe(true);
    });

    it('when the value is undefined, the action detects an error', () => {
      const action = toggleSelectStaticFilterValue({
        id: 'a',
        value: undefined as unknown as StaticFilterValue,
      });
      expect('error' in action).toBe(true);
    });
  });

  describe('#deselectAllStaticFilterValues', () => {
    it('when the id exists, it sets all values to idle', () => {
      const id = 'a';
      const value = buildMockStaticFilterValue({state: 'selected'});
      const filter = buildMockStaticFilterSlice({values: [value]});
      const action = deselectAllStaticFilterValues(id);

      const state = staticFilterSetReducer({[id]: filter}, action);
      expect(state[id].values).toContainEqual({...value, state: 'idle'});
    });

    it('when the id does not exist, it does not throw', () => {
      const id = 'a';
      const action = deselectAllStaticFilterValues(id);

      expect(() => staticFilterSetReducer({}, action)).not.toThrow();
    });

    it('when the id is an empty string, the action detects an error', () => {
      const action = deselectAllStaticFilterValues('');
      expect('error' in action).toBe(true);
    });
  });

  describe('#restoreSearchParameters', () => {
    it(`when the #sf record contains a valid id and caption, and the caption in state is not selected,
    it selects it`, () => {
      const id = 'a';
      const value = buildMockStaticFilterValue({caption: 'a', state: 'idle'});
      const filter = buildMockStaticFilterSlice({values: [value]});

      const action = restoreSearchParameters({sf: {[id]: [value.caption]}});
      const state = staticFilterSetReducer({a: filter}, action);

      expect(state[id].values).toEqual([{...value, state: 'selected'}]);
    });

    it(`when the #sf record is empty, and a caption in state is selected,
    it sets it to idle`, () => {
      const id = 'a';
      const value = buildMockStaticFilterValue({
        caption: 'a',
        state: 'selected',
      });
      const filter = buildMockStaticFilterSlice({values: [value]});

      const action = restoreSearchParameters({sf: {}});
      const state = staticFilterSetReducer({a: filter}, action);

      expect(state[id].values).toEqual([{...value, state: 'idle'}]);
    });
  });

  it('#deselectAllBreadcrumbs sets selected values in all static filters to idle', () => {
    const valueA = buildMockStaticFilterValue({
      caption: 'a',
      state: 'selected',
    });
    const valueB = buildMockStaticFilterValue({
      caption: 'b',
      state: 'selected',
    });

    const filterA = buildMockStaticFilterSlice({values: [valueA]});
    const filterB = buildMockStaticFilterSlice({values: [valueB]});

    const action = deselectAllBreadcrumbs();
    const state = staticFilterSetReducer({a: filterA, b: filterB}, action);

    expect(state.a.values).toEqual([{...valueA, state: 'idle'}]);
    expect(state.b.values).toEqual([{...valueB, state: 'idle'}]);
  });
});
