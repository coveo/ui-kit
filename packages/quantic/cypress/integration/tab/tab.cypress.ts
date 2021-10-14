import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {TabExpectations as Expect} from './tab-expectations';
import {TabActions as Actions} from './tab-actions';
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
    it('should work as expected', () => {
      visitTab(
        {
          label: tabs.case.label,
          expression: tabs.case.expression,
          isActive: true,
        },
        false
      );

      Expect.numberOfTabs(3);
      Expect.tabsEqual([tabs.all.label, tabs.case.label, tabs.knowledge.label]);
      Expect.activeTabContains(tabs.case.label);
      Expect.search.constantExpressionEqual(tabs.case.expression);

      [tabs.all, tabs.knowledge].forEach((next) => {
        Actions.selectTab(next.label);
        Expect.search.constantExpressionEqual(next.expression);
        Expect.logSelected(next.label);
        Expect.activeTabContains(next.label);
      });

      performSearch();
      Expect.search.constantExpressionEqual(tabs.knowledge.expression);
    });
  });

  describe('when loading selected tab from URL', () => {
    it('should make the right tab active', () => {
      loadFromUrlHash({}, `tab=${tabs.knowledge.label}`);

      Expect.search.constantExpressionEqual(tabs.knowledge.expression);
      Expect.activeTabContains(tabs.knowledge.label);
    });
  });
});
