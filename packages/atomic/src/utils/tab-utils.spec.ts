import {TabSetState} from '@coveo/headless/dist/definitions/features/tab-set/tab-set-state';
import {getActiveTab, shouldDisplayOnCurrentTab} from './tab-utils';

describe('tab-utils', () => {
  let tabSetState: TabSetState;
  let includeTabs: string[];
  let excludeTabs: string[];

  beforeEach(() => {
    tabSetState = {
      tab1: {id: 'tab1', isActive: false, expression: ''},
      tab2: {id: 'tab2', isActive: false, expression: ''},
      tab3: {id: 'tab3', isActive: false, expression: ''},
    };
    includeTabs = [];
    excludeTabs = [];
  });

  describe('getActiveTab', () => {
    it('returns null when no tabs exist', () => {
      tabSetState = {};
      expect(getActiveTab(tabSetState)).toEqual(null);
    });

    it('returns null when no tab is active', () => {
      expect(getActiveTab(tabSetState)).toEqual(null);
    });

    it('returns the active tab when one tab is active', () => {
      tabSetState.tab1.isActive = true;
      expect(getActiveTab(tabSetState)).toEqual('tab1');
    });

    it('returns the first active tab when multiple tabs are active', () => {
      tabSetState.tab1.isActive = true;
      tabSetState.tab2.isActive = true;
      expect(getActiveTab(tabSetState)).toEqual('tab1');
    });
  });
  describe('shouldDisplayOnCurrentTab', () => {
    describe('Given a tab is active', () => {
      beforeEach(() => {
        tabSetState.tab1.isActive = true;
      });

      it('returns true when active tab is included and not excluded', () => {
        includeTabs = ['tab1'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, tabSetState)
        ).toBe(true);
      });

      it('returns false when active tab is excluded', () => {
        excludeTabs = ['tab1'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, tabSetState)
        ).toBe(false);
      });

      it('returns false when active tab is both included and excluded', () => {
        includeTabs = ['tab1'];
        excludeTabs = ['tab1'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, tabSetState)
        ).toBe(false);
      });

      it('returns false when tabs are included, no tabs are excluded, and the active tab is different', () => {
        includeTabs = ['tab2', 'tab3'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, tabSetState)
        ).toBe(false);
      });

      it('returns true when tabs are excluded, no tabs are included, and the active tab is different', () => {
        excludeTabs = ['tab2', 'tab3'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, tabSetState)
        ).toBe(true);
      });
    });
    describe('Given no tab is active', () => {
      test.each([
        ['not included or excluded', [], []],
        ['included', ['tab1', 'tab2', 'tab3'], []],
        ['excluded', [], ['tab1', 'tab2', 'tab3']],
        [
          'excluded and included',
          ['tab1', 'tab2', 'tab3'],
          ['tab1', 'tab2', 'tab3'],
        ],
      ])(
        'returns true when no tab is active and tabs are %s',
        (_, includeTabs, excludeTabs) => {
          expect(
            shouldDisplayOnCurrentTab(includeTabs, excludeTabs, tabSetState)
          ).toBe(true);
        }
      );
    });
  });
});
