import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {getQueryAlias, interceptSearch} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {TabBarActions as Actions} from './tab-bar-actions';
import {TabBarExpectations as Expect} from './tab-bar-expectations';

interface TabBarOptions {
  lightTheme: boolean;
  useCase: string;
}

describe('quantic-tab-bar', () => {
  const pageUrl = 's/quantic-tab-bar';
  const extraSmallViewportWidth = 200;
  const smallViewportWidth = 260;
  const mediumViewportWidth = 300;
  const moreButtonLabel = 'More';
  const TAB_1 = 'Tab 1';
  const TAB_2 = 'Tab 2';
  const TAB_3 = 'Tab 3';
  const TAB_4 = 'Tab 4';

  function visitPage(
    options: Partial<TabBarOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getQueryAlias(options.useCase));
    }
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe("when the container's width can fit all the tabs", () => {
        it('should display all the tabs without displaying the dropdown list', () => {
          visitPage({useCase: param.useCase});

          scope('when loading the page', () => {
            Expect.displayTabs(true);
            Expect.displayWithLightTheme(false);
            Expect.displayedTabsEqual([TAB_1, TAB_2, TAB_3, TAB_4]);
            Expect.activeTabContains(TAB_1);
            Expect.displayMoreButton(false);
            Expect.displayDropdown(false);
          });

          scope('when selecting a new tab', () => {
            Actions.selectTab(TAB_2);
            Expect.activeTabContains(TAB_2);
          });
        });
      });

      describe('when the viewport is resized to a medium width', () => {
        it('should display only the first two tabs, the other tabs should be displayed in the dropdown list', () => {
          cy.viewport(mediumViewportWidth, 900);
          visitPage({useCase: param.useCase});

          scope('when loading the page', () => {
            Expect.displayTabs(true);
            Expect.displayWithLightTheme(false);
            Expect.displayedTabsEqual([TAB_1, TAB_2]);
            Expect.tabsInDropdownEqual([TAB_3, TAB_4]);
            Expect.activeTabContains(TAB_1);
            Expect.displayMoreButton(true);
            Expect.displayMoreButtonIcon(true);
            Expect.displayMoreButtonLabel(moreButtonLabel);
            Expect.displayDropdown(false);
          });

          scope('when selecting a new tab', () => {
            Actions.selectTab(TAB_2);
            Expect.activeTabContains(TAB_2);
          });

          scope('when selecting a new tab from the dropdown list', () => {
            Actions.openDropdown();
            Expect.displayDropdown(true);
            Actions.selectTabFromDropdown(TAB_3);
            Expect.displayDropdown(false);
            Expect.activeTabContains(TAB_3);
            Expect.displayedTabsEqual([TAB_1, TAB_3]);
            Expect.tabsInDropdownEqual([TAB_2, TAB_4]);
          });
        });
      });

      describe('when the viewport is resized to a small width', () => {
        it('should display only the selected tab, the other tabs should be displayed in the dropdown list', () => {
          cy.viewport(smallViewportWidth, 900);
          visitPage({useCase: param.useCase});

          scope('when loading the page', () => {
            Expect.displayTabs(true);
            Expect.displayWithLightTheme(false);
            Expect.displayedTabsEqual([TAB_1]);
            Expect.tabsInDropdownEqual([TAB_2, TAB_3, TAB_4]);
            Expect.activeTabContains(TAB_1);
            Expect.displayMoreButton(true);
            Expect.displayMoreButtonIcon(true);
            Expect.displayMoreButtonLabel(moreButtonLabel);
            Expect.displayDropdown(false);
          });

          scope('when selecting a new tab from the dropdown', () => {
            Actions.openDropdown();
            Expect.displayDropdown(true);
            Actions.selectTabFromDropdown(TAB_3);
            Expect.displayDropdown(false);
            Expect.activeTabContains(TAB_3);
            Expect.displayedTabsEqual([TAB_3]);
            Expect.tabsInDropdownEqual([TAB_1, TAB_2, TAB_4]);
          });
        });
      });

      describe('when the viewport is resized to an extra small width', () => {
        it('should display only the selected tab, the other tabs should be displayed in the dropdown list and the more button should be shrunk', () => {
          cy.viewport(extraSmallViewportWidth, 900);
          visitPage({useCase: param.useCase});

          scope('when loading the page', () => {
            Expect.displayTabs(true);
            Expect.displayWithLightTheme(false);
            Expect.displayedTabsEqual([TAB_1]);
            Expect.tabsInDropdownEqual([TAB_2, TAB_3, TAB_4]);
            Expect.activeTabContains(TAB_1);
            Expect.displayMoreButton(true);
            Expect.displayMoreButtonIcon(true);
            Expect.displayMoreButtonLabel('');
            Expect.displayDropdown(false);
          });

          scope('when selecting a new tab from the dropdown', () => {
            Actions.openDropdown();
            Expect.displayDropdown(true);
            Actions.selectTabFromDropdown(TAB_3);
            Expect.displayDropdown(false);
            Expect.activeTabContains(TAB_3);
            Expect.displayedTabsEqual([TAB_3]);
            Expect.tabsInDropdownEqual([TAB_1, TAB_2, TAB_4]);
          });
        });
      });

      describe('when the dropdown loses focus', () => {
        it('should automatically close the dropdown list', () => {
          cy.viewport(mediumViewportWidth, 900);
          visitPage({useCase: param.useCase});

          scope('when opening the dropdown list', () => {
            Actions.openDropdown();
            Expect.displayDropdown(true);
          });

          scope('when clicking outside the dropdown list', () => {
            Actions.clickContainer();
            Expect.displayDropdown(false);
          });
        });
      });

      describe('when a tab containing the same expression as another tab is selected from the dropdown list', () => {
        it('should correctly select the tab', () => {
          cy.viewport(extraSmallViewportWidth, 900);
          visitPage({useCase: param.useCase});
          cy.wait(500);

          scope('when loading the page', () => {
            Expect.displayedTabsEqual([TAB_1]);
            Expect.tabsInDropdownEqual([TAB_2, TAB_3, TAB_4]);
            Expect.activeTabContains(TAB_1);
          });

          scope('when selecting the tab', () => {
            Actions.openDropdown();
            Expect.displayDropdown(true);
            Actions.selectTabFromDropdown(TAB_4);
            Expect.displayedTabsEqual([TAB_4]);
            Expect.tabsInDropdownEqual([TAB_1, TAB_2, TAB_3]);
          });
        });
      });

      describe('when the light theme property is set to true', () => {
        it('should display the component with the light theme styles', () => {
          visitPage({useCase: param.useCase, lightTheme: true});

          scope('when loading the page', () => {
            Expect.displayTabs(true);
            Expect.displayWithLightTheme(true);
          });
        });
      });
    });
  });
});
