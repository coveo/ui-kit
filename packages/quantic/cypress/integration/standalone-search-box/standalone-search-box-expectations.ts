import {
  StandaloneSearchBoxSelectors,
  StandaloneSearchBoxSelector,
} from './standalone-search-box-selectors';

function standaloneSearchBoxExpectations(
  selector: StandaloneSearchBoxSelector
) {
  return {};
}

export const StandaloneSearchBoxExpectations = {
  ...standaloneSearchBoxExpectations(StandaloneSearchBoxSelectors),
};
