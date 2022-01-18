import {should} from '../common-selectors';
import {
  StandaloneSearchBoxSelectors,
  StandaloneSearchBoxSelector,
} from './standalone-search-box-selectors';

function standaloneSearchBoxExpectations(
  selector: StandaloneSearchBoxSelector
) {
  return {
    displayInputSearchBox: (display: boolean) => {
      selector
        .input()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the input search box`);
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
    displayCloseIcon: (display: boolean) => {
      selector
        .closeIcon()
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
    placeholderContains: (placeholder: string) => {
      selector
        .input()
        .invoke('attr', 'placeholder')
        .should('eq', placeholder)
        .logDetail(`The input search placeholder contains "${placeholder}"`);
    },
    urlHashContains: (redirectUrl: string) => {
      cy.url()
        .should('include', redirectUrl)
        .logDetail(`URL hash should contain "${redirectUrl}"`);
    },
  };
}

export const StandaloneSearchBoxExpectations = {
  ...standaloneSearchBoxExpectations(StandaloneSearchBoxSelectors),
};
