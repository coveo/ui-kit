import {
  StandaloneSearchBoxSelector,
  StandaloneSearchBoxSelectors,
} from './standalone-search-box-selectors';

function standaloneSearchBoxActions(selector: StandaloneSearchBoxSelector) {
  return {};
}

export const StandaloneSearchBoxActions = {
  ...standaloneSearchBoxActions(StandaloneSearchBoxSelectors),
};
