import {buildMockTabSlice} from '../../test/mock-tab-state.js';
import {change} from '../history/history-actions.js';
import {getHistoryInitialState} from '../history/history-state.js';
import {
  restoreSearchParameters,
  restoreTab,
} from '../search-parameters/search-parameter-actions.js';
import {registerTab, updateActiveTab} from './tab-set-actions.js';
import {tabSetReducer} from './tab-set-slice.js';

describe('tab set slice', () => {
  it('initializes state correctly', () => {
    const finalState = tabSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('it restores the tabSet on history change', () => {
    const tabA = buildMockTabSlice({id: 'a'});
    const tabB = buildMockTabSlice({id: 'b'});

    const payload = {
      ...getHistoryInitialState(),
      tabSet: {a: {...tabA, isActive: false}, b: {...tabB, isActive: true}},
    };

    const finalState = tabSetReducer(
      {
        a: {...tabA, isActive: true},
        b: {...tabB, isActive: false},
      },
      change.fulfilled(payload, '')
    );

    expect(finalState).toEqual({
      a: {...tabA, isActive: false},
      b: {...tabB, isActive: true},
    });
  });

  describe('#registerTab', () => {
    it('when the id does not exist, it registers the tab', () => {
      const tab = buildMockTabSlice({id: 'a'});
      const action = registerTab(tab);

      const finalState = tabSetReducer(undefined, action);
      expect(finalState).toEqual({a: tab});
    });

    it('when the id exists, it does not overwrite the tab', () => {
      const id = 'a';

      const initialTab = buildMockTabSlice({id, expression: 'a'});
      const newTab = buildMockTabSlice({id, expression: 'b'});

      const finalState = tabSetReducer({[id]: initialTab}, registerTab(newTab));
      expect(finalState).toEqual({[id]: initialTab});
    });

    it(`when a registered tab is active, and the new tab is not active,
    it does not the new tab`, () => {
      const tabA = buildMockTabSlice({id: 'a', isActive: true});
      const tabB = buildMockTabSlice({id: 'b', isActive: false});

      const finalState = tabSetReducer({a: tabA}, registerTab(tabB));

      expect(finalState.a.isActive).toBe(true);
      expect(finalState.b.isActive).toBe(false);
    });

    it(`when the #id is an empty string,
    the action detects an error`, () => {
      const tab = buildMockTabSlice({id: ''});
      const action = registerTab(tab);

      expect('error' in action).toBe(true);
    });

    it(`when the #expression has an incorrect type,
    the action detects an error`, () => {
      const tab = buildMockTabSlice({expression: 1 as unknown as string});
      const action = registerTab(tab);

      expect('error' in action).toBe(true);
    });
  });

  describe('#updateActiveTab', () => {
    it('when the #id exists, it sets #isActive to true', () => {
      const id = 'a';
      const tab = buildMockTabSlice({id, isActive: false});
      const finalState = tabSetReducer({[id]: tab}, updateActiveTab(id));

      expect(finalState[id]).toEqual({...tab, isActive: true});
    });

    it(`when the #id exists and there is another active tab,
    it sets #isActive on the other tab to false`, () => {
      const tabA = buildMockTabSlice({id: 'a', isActive: false});
      const tabB = buildMockTabSlice({id: 'b', isActive: true});
      const finalState = tabSetReducer(
        {a: tabA, b: tabB},
        updateActiveTab('a')
      );

      expect(finalState.b).toEqual({...tabB, isActive: false});
    });

    it('when the #id does not exist, it does nothing', () => {
      const tab = buildMockTabSlice({id: 'a', isActive: true});
      const finalState = tabSetReducer({a: tab}, updateActiveTab('b'));
      expect(finalState).toEqual({a: tab});
    });

    it(`when the #id is an empty string,
    the action detects an error`, () => {
      const action = updateActiveTab('');
      expect('error' in action).toBe(true);
    });
  });

  describe('#restoreTab', () => {
    it('when the #id exists, it sets #isActive to true', () => {
      const id = 'a';
      const tab = buildMockTabSlice({id, isActive: false});
      const finalState = tabSetReducer({[id]: tab}, restoreTab(id));

      expect(finalState[id]).toEqual({...tab, isActive: true});
    });

    it('when the #id does not exists, it does nothing', () => {
      const tab = buildMockTabSlice({id: 'a', isActive: true});
      const finalState = tabSetReducer({a: tab}, restoreTab('b'));
      expect(finalState).toEqual({a: tab});
    });
  });

  describe('#restoreSearchParameters', () => {
    it('when the #tab is defined, it sets the tab as active', () => {
      const tabA = buildMockTabSlice({id: 'a', isActive: false});
      const tabB = buildMockTabSlice({id: 'b', isActive: true});

      const finalState = tabSetReducer(
        {a: tabA, b: tabB},
        restoreSearchParameters({tab: 'a'})
      );

      expect(finalState).toEqual({
        a: {...tabA, isActive: true},
        b: {...tabB, isActive: false},
      });
    });
  });
});
