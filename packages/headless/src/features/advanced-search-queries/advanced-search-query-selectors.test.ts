import {AdvancedSearchQueriesState} from './advanced-search-queries-state.js';
import {selectAdvancedSearchQueries} from './advanced-search-query-selectors.js';

type AdvancedSearchQueryParametersSelectedProperty = 'aq' | 'cq' | 'dq' | 'lq';

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

    test("should return only not empty properties (here: 'aq') from the state", () => {
      const exampleAdvancedSearchQueries: AdvancedSearchQueriesState =
        createAdvancedSearchQueriesState(
          'aq' as AdvancedSearchQueryParametersSelectedProperty,
          'aq-parameter-value'
        );
      const expectedOutput = {
        aq: 'aq-parameter-value',
      };
      const state = {advancedSearchQueries: exampleAdvancedSearchQueries};

      const result = selectAdvancedSearchQueries(state);

      expect(result).toEqual(expectedOutput);
    });

    test("should return only not empty properties (here: 'cq') from the state", () => {
      const exampleAdvancedSearchQueries: AdvancedSearchQueriesState =
        createAdvancedSearchQueriesState(
          'cq' as AdvancedSearchQueryParametersSelectedProperty,
          'cq-parameter-value'
        );
      const expectedOutput = {
        cq: 'cq-parameter-value',
      };
      const state = {advancedSearchQueries: exampleAdvancedSearchQueries};

      const result = selectAdvancedSearchQueries(state);

      expect(result).toEqual(expectedOutput);
    });

    test("should return only not empty properties (here: 'dq') from the state", () => {
      const exampleAdvancedSearchQueries: AdvancedSearchQueriesState =
        createAdvancedSearchQueriesState(
          'dq' as AdvancedSearchQueryParametersSelectedProperty,
          'dq-parameter-value'
        );
      const expectedOutput = {
        dq: 'dq-parameter-value',
      };
      const state = {advancedSearchQueries: exampleAdvancedSearchQueries};

      const result = selectAdvancedSearchQueries(state);

      expect(result).toEqual(expectedOutput);
    });

    test("should return only not empty properties (here: 'lq') from the state", () => {
      const exampleAdvancedSearchQueries: AdvancedSearchQueriesState =
        createAdvancedSearchQueriesState(
          'lq' as AdvancedSearchQueryParametersSelectedProperty,
          'lq-parameter-value'
        );
      const expectedOutput = {
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

function createAdvancedSearchQueriesState(
  propertyUnderTest: AdvancedSearchQueryParametersSelectedProperty,
  valueSet: string
): AdvancedSearchQueriesState {
  const state = {
    aq: '',
    cq: '',
    dq: '',
    lq: '',
    aqWasSet: false,
    cqWasSet: false,
    dqWasSet: false,
    lqWasSet: false,
    defaultFilters: {
      aq: '',
      cq: '',
      dq: '',
      lq: '',
    },
  };

  state[propertyUnderTest] = valueSet;

  return state;
}
