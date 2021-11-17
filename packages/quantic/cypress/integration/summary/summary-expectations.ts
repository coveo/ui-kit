import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {SearchExpectations} from '../search-expectations';
import {SummarySelectors, SummarytSelector} from './summary-selectors';

function summarytExpectations(selector: SummarytSelector) {
  return {
    displaySummary: (display: boolean) => {
      selector
        .text()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the summary`);
    },
    displayRange: (display: boolean) => {
      selector
        .range()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the number page`);
    },
    displayTotal: (display: boolean) => {
      selector
        .total()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the total results of search`);
    },
    rangeContains: (value: string) => {
      selector
        .range()
        .contains(value)
        .logDetail(`range value should contain "${value}"`);
    },
  };
}

export const SummaryExpectations = {
  ...summarytExpectations(SummarySelectors),
  search: {
    ...SearchExpectations,
  },
};
