import {SearchBoxSelector, SearchBoxSelectors} from './search-box-selectors';

const standaloneSearchBoxActions = (selector: SearchBoxSelector) => {
  return {
    typeInSearchBox: (query: string, textarea = false) => {
      selector
        .input(textarea)
        .type(query)
        .logAction(`when typing "${query}" in search box`);
    },
    pressDownArrowOnSearchBox: (textarea = false) => {
      selector.input(textarea).type('{downarrow}');
    },
    pressEnterOnSearchBox: (textarea = false) => {
      selector.input(textarea).type('{enter}');
    },
    clickQuerySuggestion: (index: number) => {
      selector.querySuggestionByIndex(index).click();
    },
    clickClearRecentQueriesButton: () => {
      selector.clearRecentQueriesButton().click();
    },
    focusSearchBox: (textarea = false) => {
      selector.input(textarea).then((searchbox) => {
        cy.wrap(searchbox).focus();
      });
    },
    blurSearchBox: (textarea = false) => {
      selector.input(textarea).blur({force: true});
    },
  };
};

export const SearchBoxActions = {
  ...standaloneSearchBoxActions(SearchBoxSelectors),
};
