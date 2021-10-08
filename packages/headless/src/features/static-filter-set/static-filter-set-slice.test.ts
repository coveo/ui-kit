import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value';
import {registerStaticFilter} from './static-filter-set-actions';
import {staticFilterSetReducer} from './static-filter-set-slice';
import {StaticFilterValueState} from './static-filter-set-state';

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
});
