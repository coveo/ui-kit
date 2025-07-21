import {beforeEach, describe, expect, it, test} from 'vitest';
import {shouldDisplayOnCurrentTab} from './tab-utils';

describe('tab-utils', () => {
  let activeTab: string;
  let includeTabs: string[];
  let excludeTabs: string[];

  beforeEach(() => {
    activeTab = '';
    includeTabs = [];
    excludeTabs = [];
  });

  describe('shouldDisplayOnCurrentTab', () => {
    describe('Given a tab is active', () => {
      beforeEach(() => {
        activeTab = 'tab1';
      });

      it('returns true when active tab is included and not excluded', () => {
        includeTabs = ['tab1'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, activeTab)
        ).toBe(true);
      });

      it('returns false when active tab is excluded', () => {
        excludeTabs = ['tab1'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, activeTab)
        ).toBe(false);
      });

      it('returns false when active tab is both included and excluded', () => {
        includeTabs = ['tab1'];
        excludeTabs = ['tab1'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, activeTab)
        ).toBe(false);
      });

      it('returns false when tabs are included, no tabs are excluded, and the active tab is different', () => {
        includeTabs = ['tab2', 'tab3'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, activeTab)
        ).toBe(false);
      });

      it('returns true when tabs are excluded, no tabs are included, and the active tab is different', () => {
        excludeTabs = ['tab2', 'tab3'];
        expect(
          shouldDisplayOnCurrentTab(includeTabs, excludeTabs, activeTab)
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
            shouldDisplayOnCurrentTab(includeTabs, excludeTabs, activeTab)
          ).toBe(true);
        }
      );
    });
  });
});
