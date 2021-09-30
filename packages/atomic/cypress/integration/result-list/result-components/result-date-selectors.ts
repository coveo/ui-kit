import {ResultListSelectors} from '../result-list-selectors';

export const resultDateComponent = 'atomic-result-date';

export const ResultDateSelectors = {
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultDateComponent),
};
