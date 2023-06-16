import {setDesiredCount} from './automatic-facets-actions';
import {automaticFacetsReducer} from './automatic-facets-slice';
import {
  AutomaticFacetsState,
  getAutomaticFacetsInitialState,
} from './automatic-facets-state';

describe('automatic-facets slice', () => {
  let state: AutomaticFacetsState;

  beforeEach(() => {
    state = getAutomaticFacetsInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = automaticFacetsReducer(undefined, {type: ''});

    expect(finalState).toEqual({desiredCount: 1});
  });

  it('sets the desiredCount with the passed value', () => {
    const desiredCount = 5;

    const action = setDesiredCount(desiredCount);
    const finalState = automaticFacetsReducer(state, action);

    expect(finalState.desiredCount).toBe(desiredCount);
  });
});
