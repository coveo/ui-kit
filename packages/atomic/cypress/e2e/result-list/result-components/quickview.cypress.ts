import {generateComponentHTML} from '../../../fixtures/fixture-common';
import {TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addFacet} from '../../facets/facet/facet-actions';
import {addSearchBox} from '../../search-box/search-box-actions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  quickviewComponent,
  QuickviewSelectors,
  QuickviewModalSelectors,
} from './quickview-selectors';

const addQuickviewInResultList = () =>
  addResultList(
    buildTemplateWithSections({
      actions: generateComponentHTML(quickviewComponent),
    })
  );

const openModal = () => {
  cy.wait(5000);
  QuickviewSelectors.button().click();
  cy.wait(TestFixture.interceptAliases.Quickview);
  cy.expectClickEvent('documentQuickview');
};

describe('Quickview Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(quickviewComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent();
  });

  describe('when used on pdf file inside a result list and no keywords', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field: 'filetype'}))
        .withHash('f-filetype=pdf')
        .with(addQuickviewInResultList())
        .init();
    });

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(QuickviewSelectors.firstInResult);
    });

    it('should not log error to console', () => {
      CommonAssertions.assertConsoleError(false);
    });

    it('should display a header title', () => {
      openModal();

      QuickviewModalSelectors.titleLink()
        .should('exist')
        .should('have.attr', 'href');
    });

    it('should display a close button', () => {
      openModal();
      QuickviewModalSelectors.closeButton()
        .should('exist')
        .should('have.attr', 'aria-label', 'Close')
        .click();

      cy.get('body').should('not.have.class', 'atomic-modal-opened');
    });

    it('should display an iframe', () => {
      openModal();
      QuickviewModalSelectors.iframe()
        .should('exist')
        .its('0.contentDocument.body')
        .should('not.be.empty');
    });

    it('should display a pager with next navigation', () => {
      openModal();
      QuickviewModalSelectors.pagerSummary()
        .should('exist')
        .should('have.text', 'Result 1 of 10');

      QuickviewModalSelectors.nextButton().click();
      QuickviewModalSelectors.pagerSummary().should(
        'have.text',
        'Result 2 of 10'
      );
      cy.expectClickEvent('documentQuickview');
    });

    it('should display a pager with previous navigation', () => {
      openModal();
      QuickviewModalSelectors.pagerSummary()
        .should('exist')
        .should('have.text', 'Result 1 of 10');

      QuickviewModalSelectors.previousButton().click();
      QuickviewModalSelectors.pagerSummary().should(
        'have.text',
        'Result 10 of 10'
      );
      cy.expectClickEvent('documentQuickview');
    });
  });

  describe('when used on pdf file inside a result list with keywords', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field: 'filetype'}))
        .with(addSearchBox())
        .withHash('f-filetype=pdf&q=california marketing')
        .with(addQuickviewInResultList())
        .init();
    });

    it('should display keywords highlight toggle button', () => {
      openModal();
      QuickviewModalSelectors.keywordsHighlightToggleButton()
        .should('exist')
        .should('have.attr', 'aria-checked', 'true');

      QuickviewModalSelectors.keywordsSidebar()
        .find('.opacity-50')
        .should('not.exist');

      QuickviewModalSelectors.keywordsHighlightToggleButton()
        .click()
        .should('have.attr', 'aria-checked', 'false');

      QuickviewModalSelectors.keywordsSidebar()
        .find('.opacity-50')
        .should('exist');
    });

    it('should display keywords minimize toggle button', () => {
      openModal();
      QuickviewModalSelectors.keywordsMinimizeButton().should('exist').click();
      QuickviewModalSelectors.keywordsSidebar().should('not.exist');
      QuickviewModalSelectors.keywordsHighlightToggleButton().should('exist');
      QuickviewModalSelectors.keywordsMinimizeButton().click();
      QuickviewModalSelectors.keywordsSidebar().should('exist');
    });
  });

  describe('when used on pdf file inside a result list with exact phrase match', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field: 'author'}))
        .with(addSearchBox())
        .withHash('q="the%20bank"&f-author=Jules%20Verne')
        .with(addQuickviewInResultList())
        .init();
    });

    it('should display only highlight button for the phrase with multiple occurrences', () => {
      openModal();

      QuickviewModalSelectors.keywordsSidebar()
        .should('exist')
        .should('contain.text', 'Navigate between 23 occurrences of the bank');
    });
  });

  describe('when used on an excel file with a query that returns invalid HTML', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field: 'filetype'}))
        .with(addSearchBox())
        .withHash('f-filetype=xls&q=1/12')
        .with(addQuickviewInResultList())
        .init();
    });

    it('should handle displaying keywords correctly', () => {
      openModal();
      QuickviewModalSelectors.keywordsSidebar()
        .should('exist')
        .should('contain.text', 'Navigate between 12 occurrences of 1 12');
    });
  });
});
