import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value';
import {registerStaticFilter} from './static-filter-set-actions';
import {staticFilterSetReducer} from './static-filter-set-slice';

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
  });
});
