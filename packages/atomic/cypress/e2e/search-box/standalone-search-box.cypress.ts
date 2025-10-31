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
import {assertHasText, assertLogOmniboxFromLink} from './search-box-assertions';
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

  function setupStandardSearchBoxAfterStandaloneRedirect() {
    // TODO (KIT-2435): Explore a better way to wait for standalone redirect
    cy.wait(5000); // Flakiness workaround to wait after clicking in standalone search box
    // TODO (KIT-2356): Fails in Cypress v12 @ withRedirection()
    new TestFixture().withRedirection().with(addSearchBox()).init();
  }

  it('should redirect to the default url when a search is submitted', () => {
    const url = 'https://www.google.com';
    setupStandaloneSearchBox({url});
    SearchBoxSelectors.textArea().type('test');
    SearchBoxSelectors.submitButton().click();
    cy.location('href').should('contain', url);
  });

  it('should redirect to the trigger url when there is a redirect trigger', () => {
    const url = 'https://platformstg.cloud.coveo.com';
    setupStandaloneSearchBox({url});
    SearchBoxSelectors.textArea().type('redirect testing');
    SearchBoxSelectors.submitButton().click();
    cy.location('href').should('contain', url);
  });

  describe('when being redirected to an Atomic Search Interface after submitting a query', () => {
    const query = 'hello';

    it(`should contain "${query}" and log a proper analytics event`, () => {
      setupStandaloneSearchBox();
      SearchBoxSelectors.textArea().type(query);
      SearchBoxSelectors.submitButton().click();
      setupStandardSearchBoxAfterStandaloneRedirect();
      SearchBoxSelectors.textArea().should('have.value', query);
      cy.expectSearchEvent('searchFromLink').then((analyticsBody) => {
        expect(analyticsBody).to.have.property('queryText', query);
      });
    });
  });

  describe('when being redirected to an Atomic Search Interface after selecting a suggestion', () => {
    const query = 'how';
    beforeEach(() => {
      setupStandaloneSearchBox();
      SearchBoxSelectors.textArea().type(query);
      SearchBoxSelectors.querySuggestions().eq(0).click();
      setupStandardSearchBoxAfterStandaloneRedirect();
    });

    assertHasText(query);
    assertLogOmniboxFromLink(query);
  });

  describe('with the query syntax enabled, after submitting a query', () => {
    const query = '@urihash=Wl1SZoqFsR8bpsbG';
    beforeEach(() => {
      setupStandaloneSearchBox({enableQuerySyntax: true});
      SearchBoxSelectors.textArea().type(query);
      SearchBoxSelectors.submitButton().click();
      cy.wait(5000); // Flakiness workaround to wait after clicking in standalone search box
      new TestFixture()
        // TODO (KIT-2356): Fails in Cypress v12 @ withRedirection()
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
      ResultTextSelectors.firstInResult().find('atomic-text').shadow().should('have.text', 'bushy lichens');
    });
  });
});
