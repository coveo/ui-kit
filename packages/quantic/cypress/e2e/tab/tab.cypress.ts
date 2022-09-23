import {configure} from '../../page-objects/configurator';
import {
  getAlias,
  interceptSearch,
  mockSearchNoResults,
} from '../../page-objects/search';
import {TabExpectations as Expect} from './tab-expectations';
import {TabActions as Actions} from './tab-actions';
import {performSearch} from '../../page-objects/actions/action-perform-search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../page-objects/use-case';

interface TabOptions {
  label: string;
  expression: string;
  isActive: boolean;
  useCase: string;
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
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getAlias(options.useCase));
    }
  }

  function loadFromUrlHash(options: Partial<TabOptions> = {}, urlHash: string) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('with active tab', () => {
        beforeEach(() => {
          visitTab(
            {
              label: tabs.case.label,
              expression: tabs.case.expression,
              isActive: true,
              useCase: param.useCase,
            },
            false
          );
        });

        it('should not show tabs before search completes', () => {
          Expect.displayTabs(false);

          cy.wait(getAlias(param.useCase));
          Expect.displayTabs(true);
        });

        it('should work as expected', () => {
          Expect.search.constantExpressionEqual(
            tabs.case.expression,
            param.useCase
          );
          Expect.numberOfTabs(3);
          Expect.tabsEqual([
            tabs.all.label,
            tabs.case.label,
            tabs.knowledge.label,
          ]);
          Expect.activeTabContains(tabs.case.label);

          [tabs.all, tabs.knowledge].forEach((next) => {
            Actions.selectTab(next.label);
            Expect.search.constantExpressionEqual(
              next.expression,
              param.useCase
            );
            Expect.logSelected(next.label);
            Expect.activeTabContains(next.label);
          });

          performSearch();
          Expect.search.constantExpressionEqual(
            tabs.knowledge.expression,
            param.useCase
          );
          Expect.displayTabs(true);

          mockSearchNoResults(param.useCase);
          performSearch();
          cy.wait(getAlias(param.useCase));
          Expect.displayTabs(true);
        });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('when loading selected tab from URL', () => {
          it('should make the right tab active', () => {
            loadFromUrlHash({}, `tab=${tabs.knowledge.label}`);

            Expect.search.constantExpressionEqual(
              tabs.knowledge.expression,
              param.useCase
            );
            Expect.activeTabContains(tabs.knowledge.label);
          });
        });
      }
    });
  });

  describe('when using accessibility', () => {
    it('should be accessible to keyboard', () => {
      loadFromUrlHash({}, `tab=${tabs.case.label}`);

      // Select tab using the space bar
      Actions.selectTab(tabs.all.label, ' ');
      Expect.activeTabContains(tabs.all.label);

      Actions.findTabPressTabPressSpace(tabs.case.label);
      Expect.activeTabContains(tabs.knowledge.label);

      Actions.findTabPressShiftTabPressSpace(tabs.case.label);
      Expect.activeTabContains(tabs.all.label);
    });
  });
});
