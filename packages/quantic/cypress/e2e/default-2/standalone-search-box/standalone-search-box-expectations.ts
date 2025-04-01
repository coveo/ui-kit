import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {
  StandaloneSearchBoxSelectors,
  StandaloneSearchBoxSelector,
} from './standalone-search-box-selectors';

const REQUEST_TIMEOUT = 5000;

function standaloneSearchBoxExpectations(
  selector: StandaloneSearchBoxSelector
) {
  return {
    displayInputSearchBox: (display: boolean, textarea = false) => {
      selector
        .input(textarea)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the input search box`);
    },
    inputInitialized: () => {
      selector
        .quanticSearchBoxInput()
        .invoke('attr', 'is-initialized')
        .should('eq', 'true');
    },
    displaySearchIcon: (display: boolean) => {
      selector
        .searchIcon()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the search icon`);
    },
    displaySearchButton: (display: boolean) => {
      selector
        .searchButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the search button`);
    },
    displayClearButton: (display: boolean) => {
      selector
        .clearButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the close icon`);
    },
    displaySuggestionList: (display: boolean) => {
      selector
        .suggestionList()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the suggestion list`);
    },
    numberOfSuggestions: (value: number) => {
      selector
        .suggestionList()
        .should('have.length', value)
        .logDetail(`should display ${value} suggestions`);
    },
    placeholderContains: (placeholder: string, textarea = false) => {
      selector
        .input(textarea)
        .invoke('attr', 'placeholder')
        .should('eq', placeholder)
        .logDetail(`The input search placeholder contains "${placeholder}"`);
    },
    inputContains: (value: string, textarea = false) => {
      selector.input(textarea).invoke('attr', 'value').contains(value);
    },
    inputStyleMatches: (expectedText: string, textarea = false) => {
      selector
        .input(textarea)
        .invoke('attr', 'style', expectedText)
        .should('have.attr', 'style', expectedText)
        .logDetail(
          'condition function on style of the input should return true'
        );
    },
    urlContains: (redirectUrl: string) => {
      cy.url()
        .should('include', redirectUrl)
        .logDetail(`URL hash should contain "${redirectUrl}"`);
    },
    logSearchFromLink: (query: string, requestTimeout = REQUEST_TIMEOUT) => {
      cy.wait(InterceptAliases.UA.SearchFromLink, {requestTimeout})
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'searchFromLink'
          );
          expect(analyticsBody).to.have.property('queryText', query);
        })
        .logDetail('should log the "searchFromLink" UA event');
    },
    fetchQuerySuggestWithParams: (
      params: Record<string, string | number | boolean>,
      alias: string
    ) => {
      cy.wait(alias);
      cy.logDetail(
        `should fetch query suggestions with ${JSON.stringify(params)}`
      );
    },
  };
}

export const StandaloneSearchBoxExpectations = {
  ...standaloneSearchBoxExpectations(StandaloneSearchBoxSelectors),
};
