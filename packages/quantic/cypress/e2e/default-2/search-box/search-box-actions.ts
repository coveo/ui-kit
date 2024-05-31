import {InterceptAliases} from '../../../page-objects/search';
import {SearchBoxSelector, SearchBoxSelectors} from './search-box-selectors';

const standaloneSearchBoxActions = (selector: SearchBoxSelector) => {
  return {
    typeInSearchBox: (query: string, textarea = false) => {
      selector
        .input(textarea)
        .then((searchbox) => {
          let updateText = '';
          query.split('').forEach((letter) => {
            updateText += letter;
            cy.wrap(searchbox)
              .invoke('val', updateText)
              .trigger('keyup', {which: letter.charCodeAt(0)});
            cy.wait(InterceptAliases.QuerySuggestions);
          });
        })
        .logAction(`when typing "${query}" in search box`);
    },
    clickQuerySuggestion: (index: number) => {
      selector.querySuggestion(index).click();
    },
    clickClearRecentQueriesButton: () => {
      selector.clearRecentQueriesButton().click();
    },
    focusSearchBox: (textarea = false) => {
      selector.input(textarea).then((searchbox) => {
        cy.wrap(searchbox).focus();
      });
    },
  };
};

export const SearchBoxActions = {
  ...standaloneSearchBoxActions(SearchBoxSelectors),
};
