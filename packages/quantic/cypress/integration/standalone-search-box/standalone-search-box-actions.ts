import {
  StandaloneSearchBoxSelector,
  StandaloneSearchBoxSelectors,
} from './standalone-search-box-selectors';

const standaloneSearchBoxActions = (selector: StandaloneSearchBoxSelector) => {
  return {
    typeInSearchBox: (query: string) => {
      selector
        .input()
        .invoke('val', query)
        .logAction(`when typing "${query}" in search box`);
    },
    submitSearch: () => {
      selector.searchButton().click().logAction('when submitting query');
    },
    focusSearchBox: () => {
      selector.input().trigger('keydown', {keyCode: 27});
      cy.wait(500);
      selector.input().trigger('keyup', {keyCode: 27});
    },
    clickFirstSuggestion: () => {
      selector.suggestionList().first().click({force: true});
    },
    typeAndPressEnter: () => {
      selector.input().then((searchbox) => {
        cy.wrap(searchbox).trigger('keyup', {key: 'Enter'});
      });
    },
  };
};

export const StandaloneSearchBoxActions = {
  ...standaloneSearchBoxActions(StandaloneSearchBoxSelectors),
};
