import {InterceptAliases} from '../../../page-objects/search';
import {
  StandaloneSearchBoxSelector,
  StandaloneSearchBoxSelectors,
} from './standalone-search-box-selectors';

const standaloneSearchBoxActions = (selector: StandaloneSearchBoxSelector) => {
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
    submitSearch: () => {
      selector.searchButton().click().logAction('when submitting query');
    },
    focusSearchBox: (textarea = false) => {
      selector.input(textarea).then((searchbox) => {
        cy.wrap(searchbox).focus();
      });
    },
    clickFirstSuggestion: () => {
      selector.suggestionList().first().click({force: true});
    },
    pressEnter: (textarea = false) => {
      selector.input(textarea).then((searchbox) => {
        cy.wrap(searchbox).trigger('keyup', {key: 'Enter'});
      });
    },
  };
};

export const StandaloneSearchBoxActions = {
  ...standaloneSearchBoxActions(StandaloneSearchBoxSelectors),
};
