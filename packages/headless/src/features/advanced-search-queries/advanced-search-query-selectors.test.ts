import {AdvancedSearchQueriesState} from './advanced-search-queries-state.js';
import {selectAdvancedSearchQueries} from './advanced-search-query-selectors.js';

describe('advancedQuerySearch Selectors test suite', () => {
  describe('#selectAdvancedSearchQueries', () => {
    it('should return an empty object when advancedSearchQueries is undefined', () => {
      const expectedOutput = {};
      const state = {advancedSearchQueries: undefined};

      const result = selectAdvancedSearchQueries(state);

      expect(result).toEqual(expectedOutput);
    });

    it('should return only the properties aq, cq, dq, and lq from the state', () => {
      const exampleAdvancedSearchQueries: AdvancedSearchQueriesState =
        newExampleAdvancedSearchQueriesStateFixture();
      const expectedOutput = {
        aq: 'aq-parameter-value',
        cq: 'cq-parameter-value',
        dq: 'dq-parameter-value',
        lq: 'lq-parameter-value',
      };
      const state = {advancedSearchQueries: exampleAdvancedSearchQueries};

      const result = selectAdvancedSearchQueries(state);
      expect(result).toEqual(expectedOutput);
    });
  });
});

function newExampleAdvancedSearchQueriesStateFixture() {
  return {
    aq: 'aq-parameter-value',
    cq: 'cq-parameter-value',
    dq: 'dq-parameter-value',
    lq: 'lq-parameter-value',
    aqWasSet: true,
    cqWasSet: false,
    dqWasSet: false,
    lqWasSet: true,
    defaultFilters: {
      aq: 'a-default-aq-parameter-value',
      cq: 'a-default-cq-parameter-value',
      dq: 'a-default-dq-parameter-value',
      lq: 'a-default-lq-parameter-value',
    },
  };
}
