import {should} from '../common-selectors';
import {SummarySelectors, SummarySelector} from './summary-selectors';

function summarytExpectations(selector: SummarySelector) {
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
        .logDetail(`${should(display)} display the range`);
    },
    displayTotal: (display: boolean) => {
      selector
        .total()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the total results of search`);
    },
    displayQuery: (display: boolean) => {
      selector
        .query()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the query`);
    },
    rangeContains: (value: string) => {
      selector
        .range()
        .contains(value)
        .logDetail(`range value should contain "${value}"`);
    },
    totalContains: (value: string) => {
      selector
        .total()
        .contains(value)
        .logDetail(`total value should contain "${value}"`);
    },
    queryContains: (value: string) => {
      selector
        .query()
        .contains(value)
        .logDetail(`query value should contain "${value}"`);
    },
  };
}

export const SummaryExpectations = {
  ...summarytExpectations(SummarySelectors),
};
