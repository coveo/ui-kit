import {TestFixture} from '../fixtures/test-fixture';
import {addSearchBox} from './search-box/search-box-actions';
import {
  assertHasText,
  assertLogOmniboxFromLink,
  assertLogSearchFromLink,
} from './search-box/search-box-assertions';
import {SearchBoxSelectors} from './search-box/search-box-selectors';

describe('Standalone Search Box Test Suites', () => {
  function setupStandaloneSearchBox(url = '/test.html') {
    new TestFixture()
      .withoutFirstAutomaticSearch()
      .with(
        addSearchBox({
          props: {'redirection-url': url},
        })
      )
      .init();
  }

  function setupStandardSearchBox() {
    new TestFixture().withRedirection().with(addSearchBox()).init();
  }

  it('should redirect to the default url when a search is submitted', () => {
    const url = 'https://www.google.com';
    setupStandaloneSearchBox(url);
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
});
