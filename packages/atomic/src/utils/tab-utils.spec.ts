import {getActiveTab, shouldDisplayOnCurrentTab} from './tab-utils';

describe('getActiveTab', () => {
  it('returns null when state.tabSet is undefined', () => {
    const state = {};
    expect(getActiveTab(state)).toEqual(null);
  });

  it('returns null when no tab is active', () => {
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: false, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      },
    };
    expect(getActiveTab(state)).toEqual(null);
  });

  it('returns the active tab when one tab is active', () => {
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: true, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      },
    };
    expect(getActiveTab(state)).toEqual({tab: 'tab2'});
  });

  it('returns the first active tab when multiple tabs are active', () => {
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: true, expression: ''},
        tab2: {id: 'tab2', isActive: true, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      },
    };
    expect(getActiveTab(state)).toEqual({tab: 'tab1'});
  });
});

describe('shouldDisplayOnCurrentTab', () => {
  it('returns true when active tab is included and no tabs are excluded', () => {
    const tabs = 'tab1;tab2;tab3';
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: true, expression: ''},
        tab2: {id: 'tab2', isActive: false, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      },
    };
    expect(shouldDisplayOnCurrentTab(tabs, state)).toBe(true);
  });

  it('returns false when active tab is excluded and no tabs are included', () => {
    const tabs = '!tab1;!tab2;!tab3';
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: true, expression: ''},
        tab2: {id: 'tab2', isActive: false, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      },
    };
    expect(shouldDisplayOnCurrentTab(tabs, state)).toBe(false);
  });

  it('returns false when active tab is excluded and included in the excluded tabs', () => {
    const tabs = '!tab1;!tab2;!tab3';
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: true, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      },
    };
    expect(shouldDisplayOnCurrentTab(tabs, state)).toBe(false);
  });

  it('returns true when active tab is included and not excluded', () => {
    const tabs = 'tab1;tab2;!tab3';
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: true, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      },
    };
    expect(shouldDisplayOnCurrentTab(tabs, state)).toBe(true);
  });

  it('returns true when a single tab is excluded and the active tab is different', () => {
    const tabs = '!tab1';
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: true, expression: ''},
      },
    };
    expect(shouldDisplayOnCurrentTab(tabs, state)).toBe(true);
  });
  it('returns true when no tab is active', () => {
    const tabs = 'tab1';
    const state = {
      tabSet: {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: false, expression: ''},
      },
    };
    expect(shouldDisplayOnCurrentTab(tabs, state)).toBe(true);
  });
});
