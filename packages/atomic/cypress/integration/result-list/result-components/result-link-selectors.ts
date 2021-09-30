import {ResultListSelectors} from '../result-list-selectors';

export const resultLinkComponent = 'atomic-result-link';

export const ResultLinkSelectors = {
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultLinkComponent),
};
