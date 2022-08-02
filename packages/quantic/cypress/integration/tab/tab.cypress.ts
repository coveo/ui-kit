import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  mockSearchNoResults,
} from '../../page-objects/search';
import {TabExpectations as Expect} from './tab-expectations';
import {TabActions as Actions, TabActions} from './tab-actions';
import {TabSelector, TabSelectors} from './tab-selectors';
import {performSearch} from '../../page-objects/actions/action-perform-search';

interface TabOptions {
  label: string;
  expression: string;
  isActive: boolean;
}

describe('quantic-tab', () => {
  const pageUrl = 's/quantic-tab';

  const tabs = {
    all: {
      label: 'All',
      expression: undefined,
    },
    case: {
      label: 'Case',
      expression: '@objecttype==Case',
    },
    knowledge: {
      label: 'Knowledge',
      expression: '@objecttype==Knowledge',
    },
  };

  function visitTab(options: Partial<TabOptions>, waitForSearch = true) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function loadFromUrlHash(options: Partial<TabOptions> = {}, urlHash: string) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  describe('with active tab', () => {
    beforeEach(() => {
      visitTab(
        {
          label: tabs.case.label,
          expression: tabs.case.expression,
          isActive: true,
        },
        false
      );
    });

    it('should not show tabs before search completes', () => {
      Expect.displayTabs(false);

      cy.wait(InterceptAliases.Search);
      Expect.displayTabs(true);
    });

    it('should work as expected', () => {
      Expect.search.constantExpressionEqual(tabs.case.expression);
      Expect.numberOfTabs(3);
      Expect.tabsEqual([tabs.all.label, tabs.case.label, tabs.knowledge.label]);
      Expect.activeTabContains(tabs.case.label);

      [tabs.all, tabs.knowledge].forEach((next) => {
        TabSelectors.button().contains(next.label);
        Actions.selectButton(next.label);
        Expect.search.constantExpressionEqual(next.expression);
        Expect.logSelected(next.label);
        Expect.activeTabContains(next.label);
      });

      performSearch();
      Expect.search.constantExpressionEqual(tabs.knowledge.expression);
      Expect.displayTabs(true);

      mockSearchNoResults();
      performSearch();
      cy.wait(InterceptAliases.Search);
      Expect.displayTabs(true);
    });
  });

  describe('when loading selected tab from URL', () => {
    it('should make the right tab active', () => {
      loadFromUrlHash({}, `tab=${tabs.knowledge.label}`);

      Expect.search.constantExpressionEqual(tabs.knowledge.expression);
      Expect.activeTabContains(tabs.knowledge.label);
    });
  });

  describe('when using accessibility', () => {
    beforeEach(() => {
      loadFromUrlHash({}, `tab=${tabs.all.label}`);
    });

    it('when SpaceKey is pressed', () => {
      TabSelectors.button().first().focus().type(' ');
      Expect.activeTabContains(tabs.all.label);
    });

    it('when TabKey && SpaceKey is pressed', () => {
      TabSelectors.button().first().focus().tab().type(' ');
      Expect.activeTabContains(tabs.case.label);
    });

    it('when Shift && TabKey && SpaceKey is pressed', () => {
      TabSelectors.button()
        .first()
        .focus()
        .tab()
        .tab()
        .tab({shift: true})
        .type(' ');
      Expect.activeTabContains(tabs.case.label);
    });
  });
});
