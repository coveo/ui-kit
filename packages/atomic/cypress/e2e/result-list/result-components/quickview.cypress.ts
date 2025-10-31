import {DEFAULT_MOBILE_BREAKPOINT} from '../../../../src/utils/replace-breakpoint';
import {
  TagProps,
  generateComponentHTML,
} from '../../../fixtures/fixture-common';
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

const addQuickviewInResultList = (props: TagProps = {}) =>
  addResultList(
    buildTemplateWithSections(
      {
        actions: generateComponentHTML(quickviewComponent),
      },
      props
    )
  );

const openModal = () => {
  QuickviewSelectors.button().click({timeout: 8000});
  cy.wait(TestFixture.interceptAliases.Quickview);
  cy.expectClickEvent('documentQuickview');
};

describe('Quickview Component', () => {
  it('when not used inside a result template, it should not log error to console', () => {
    new TestFixture()
      .withElement(generateComponentHTML(quickviewComponent))
      .init();

    CommonAssertions.assertRemovesComponent();
  });

  it('when used on pdf file inside a result list and no keywords, it should display correctly', () => {
    new TestFixture()
      .with(addFacet({field: 'filetype'}))
      .withHash('f-filetype=pdf')
      .with(addQuickviewInResultList())
      .init();

    cy.log('should not log error to console');
    CommonAssertions.assertConsoleErrorWithoutIt(false);

    openModal();
    cy.log('should display a header title');
    QuickviewModalSelectors.titleLink()
      .should('exist')
      .should('have.attr', 'href');

    cy.log('should display an iframe');
    QuickviewModalSelectors.iframe()
      .should('exist')
      .its('0.contentDocument.body')
      .should('not.be.empty');

    cy.log('should display a pager with next navigation');
    QuickviewModalSelectors.pagerSummary()
      .should('exist')
      .should('have.text', 'Result 1 of 10');

    QuickviewModalSelectors.nextButton();

    QuickviewModalSelectors.previousButton();

    cy.log('should display a close button');
    QuickviewModalSelectors.closeButton()
      .should('exist')
      .should('have.attr', 'aria-label', 'Close')
      .click();
  });

  it('when used on grid display result list, it should display correctly', () => {
    new TestFixture()
      .with(addFacet({field: 'filetype'}))
      .withHash('f-filetype=pdf')
      .with(
        addQuickviewInResultList({
          display: 'grid',
        })
      )
      .init();

    CommonAssertions.assertConsoleErrorWithoutIt(false);

    openModal();

    QuickviewModalSelectors.titleLink()
      .should('exist')
      .should('have.attr', 'href');

    QuickviewModalSelectors.iframe()
      .should('exist')
      .its('0.contentDocument.body')
      .should('not.be.empty');

    QuickviewModalSelectors.pagerSummary()
      .should('exist')
      .should('have.text', 'Result 1 of 10');

    QuickviewModalSelectors.nextButton();

    QuickviewModalSelectors.previousButton();

    QuickviewModalSelectors.closeButton()
      .should('exist')
      .should('have.attr', 'aria-label', 'Close')
      .click();
  });

  it('when used on pdf file inside a result list with keywords, it should display correctly', () => {
    new TestFixture()
      .with(addFacet({field: 'filetype'}))
      .with(addSearchBox())
      .withHash('f-filetype=pdf&q=Promega Corporation')
      .with(addQuickviewInResultList())
      .init();

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

    QuickviewModalSelectors.keywordsMinimizeButton().should('exist').click();
    QuickviewModalSelectors.keywordsHighlightToggleButton().should('exist');
    QuickviewModalSelectors.keywordsMinimizeButton().click();
    QuickviewModalSelectors.keywordsSidebar().should('exist');
  });

  it('when used on pdf file inside a result list with exact phrase match, it should display correctly', () => {
    new TestFixture()
      .with(addFacet({field: 'author'}))
      .with(addSearchBox())
      .withHash('q="Promega%20Corporation"&f-author=mardueng')
      .with(addQuickviewInResultList())
      .init();

    openModal();

    QuickviewModalSelectors.keywordsSidebar()
      .should('exist')
      .should(
        'contain.text',
        'Navigate between 2 occurrences of promega corporation'
      );
  });

  it('when used in mobile mode, it should be responsive', () => {
    cy.viewport(parseInt(DEFAULT_MOBILE_BREAKPOINT.slice(0, -2)) - 1, 1080);
    new TestFixture()
      .with(addFacet({field: 'author'}))
      .with(addSearchBox())
      .withHash('q="Promega%20Corporation"&f-author=mardueng')
      .with(addQuickviewInResultList())
      .init();

    openModal();
    QuickviewModalSelectors.shadow()
      .find('atomic-modal')
      .should('have.class', 'fullscreen');
    QuickviewModalSelectors.shadow()
      .find('[part="sidebar-remove-word-container"]')
      .should('not.exist');
  });

  it('when used in desktop mode, it should be responsive', () => {
    new TestFixture()
      .with(addFacet({field: 'author'}))
      .with(addSearchBox())
      .withHash('q="Promega%20Corporation"&f-author=mardueng')
      .with(addQuickviewInResultList())
      .init();

    openModal();
    QuickviewModalSelectors.shadow()
      .find('atomic-modal')
      .should('not.have.class', 'fullscreen');
    QuickviewModalSelectors.shadow()
      .find('[part="sidebar-remove-word-container"]')
      .should('exist');
  });
});
