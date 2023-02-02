import {RouteAlias, setupIntercept} from '../../fixtures/fixture-common';
import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {
  resultTextComponent,
  ResultTextSelectors,
} from '../result-list/result-components/result-text-selectors';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list/result-list-actions';
import {addSearchBox} from './search-box-actions';
import {
  assertHasText,
  assertLogOmniboxFromLink,
  assertLogSearchFromLink,
} from './search-box-assertions';
import {SearchBoxSelectors} from './search-box-selectors';

describe('Standalone Search Box Test Suites', () => {
  function setupStandaloneSearchBox(options?: {
    url?: string;
    enableQuerySyntax?: boolean;
  }) {
    new TestFixture()
      .withoutFirstAutomaticSearch()
      .with(
        addSearchBox({
          props: {
            'redirection-url': options?.url ?? '/test.html',
            ...(options?.enableQuerySyntax && {'enable-query-syntax': ''}),
          },
        })
      )
      .init();
  }

  function setupStandardSearchBox() {
    new TestFixture().withRedirection().with(addSearchBox()).init();
  }

  it('should redirect to the default url when a search is submitted', () => {
    const url = 'https://www.google.com';
    setupStandaloneSearchBox({url});
    SearchBoxSelectors.inputBox().type('test');
    SearchBoxSelectors.submitButton().click();
    cy.location('href').should('contain', url);
  });

  it('should redirect to the trigger url when there is a redirect trigger', () => {
    const url = 'https://platformstg.cloud.coveo.com';
    setupStandaloneSearchBox();
    SearchBoxSelectors.inputBox().type('redirect testing');
    SearchBoxSelectors.submitButton().click();
    cy.location('href').should('contain', url);
  });

  describe('when being redirected to an Atomic Search Interface after submitting a query', () => {
    const query = 'hello';
    beforeEach(() => {
      setupStandaloneSearchBox();
      SearchBoxSelectors.inputBox().type(query);
      SearchBoxSelectors.submitButton().click();
      setupStandardSearchBox();
    });

    assertHasText(query);
    assertLogSearchFromLink(query);
  });

  describe('when being redirected to an Atomic Search Interface after selecting a suggestion', () => {
    const query = 'awards';
    beforeEach(() => {
      setupStandaloneSearchBox();
      SearchBoxSelectors.inputBox().type(query);
      SearchBoxSelectors.querySuggestions().eq(0).click();
      setupStandardSearchBox();
    });

    assertHasText(query);
    assertLogOmniboxFromLink(query);
  });

  describe('with the query syntax enabled, after submitting a query', () => {
    const query = '@urihash=Wl1SZoqFsR8bpsbG';
    beforeEach(() => {
      setupStandaloneSearchBox({enableQuerySyntax: true});
      SearchBoxSelectors.inputBox().type(query);
      SearchBoxSelectors.submitButton().click();
      new TestFixture()
        .withRedirection()
        .with(addSearchBox({props: {'enable-query-syntax': ''}}))
        .with(
          addResultList(
            buildTemplateWithoutSections(
              generateComponentHTML(resultTextComponent, {field: 'title'})
            )
          )
        )
        .init();
    });

    it('has the query syntax in the url', () => {
      cy.location('hash').should('contain', 'enableQuerySyntax=true');
    });

    it('uses the query syntax for the first search', () => {
      ResultTextSelectors.firstInResult().should('have.text', 'bushy lichens');
    });
  });

  describe('with a default search param on the target page (e.g. tabs)', () => {
    const query = 'test';
    const queryParam = `q=${query}`;
    const defaultParam = 'tab=all-tab';
    const incorrectParam = 'tab=not-a-tab';
    const defaultHash = `#${queryParam}&${defaultParam}`;
    const standalonePage = '/examples/standalone.html';
    const standaloneResultsPage = '/examples/standalone-results.html';

    beforeEach(() => {
      setupIntercept();
      cy.visit(standalonePage);

      cy.get('atomic-search-box')
        .shadow()
        .find('input')
        .type(`${query}{enter}`);

      cy.wait(RouteAlias.UA);
    });

    it('should append the default search param value', () => {
      cy.location('pathname').should('eq', standaloneResultsPage);
      cy.hash().should('eq', defaultHash);
    });

    it('when going back once, should go to original page directly (no hash)', () => {
      cy.go('back');
      cy.location('pathname').should('eq', standalonePage);
      cy.hash().should('eq', '');
    });

    it('when manually setting an invalid hash, it should allow going back', () => {
      const newHash = `#${queryParam}&${incorrectParam}`;
      cy.visit(`${standaloneResultsPage}${newHash}`);
      cy.hash().should('eq', newHash);

      cy.go('back');
      cy.location('pathname').should('eq', standaloneResultsPage);
      cy.hash().should('eq', defaultHash);
    });
  });
});
