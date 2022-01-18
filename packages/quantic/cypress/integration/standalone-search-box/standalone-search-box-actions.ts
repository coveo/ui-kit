import {
  StandaloneSearchBoxSelector,
  StandaloneSearchBoxSelectors,
} from './standalone-search-box-selectors';

const standaloneSearchBoxActions = (selector: StandaloneSearchBoxSelector) => {
  return {
    typeInSearchBox: (query: string) => {
      selector
        .input()
        .type(query, {force: true})
        .logAction(`when typing "${query}" in search box`);
    },
  };
};

export const StandaloneSearchBoxActions = {
  ...standaloneSearchBoxActions(StandaloneSearchBoxSelectors),
};
