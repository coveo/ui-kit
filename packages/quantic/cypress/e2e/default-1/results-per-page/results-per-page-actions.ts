import {ResultsPerPageSelectors} from './results-per-page-selectors';

export const ResultsPerPageActions = {
  selectValue: (value: number) => {
    ResultsPerPageSelectors.choice().contains(value).click();
  },
};
