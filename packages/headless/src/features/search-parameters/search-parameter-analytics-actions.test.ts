import {buildMockSearchAppEngine} from '../../test';
import {
  interfaceChange,
  logInterfaceChange,
} from '../analytics/analytics-actions';
import {LegacySearchAction} from '../analytics/analytics-utils';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetExclude,
  facetDeselect,
  facetClearAll,
  facetExclude,
} from '../facets/facet-set/facet-set-analytics-actions';
import {
  logPageNumber,
  logPagerResize,
} from '../pagination/pagination-analytics-actions';
import {
  logSearchboxSubmit,
  searchboxSubmit,
} from '../query/query-analytics-actions';
import {
  logResultsSort,
  resultsSort,
} from '../sort-criteria/sort-criteria-analytics-actions';
import {
  legacyLogParametersChange,
  parametersChange,
} from './search-parameter-analytics-actions';

describe('legacyLogParametersChange', () => {
  function expectIdenticalActionType(
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) {
    const engine = buildMockSearchAppEngine();
    engine.dispatch(action1);
    engine.dispatch(action2);
    expect(engine.actions[0].type).toEqual(engine.actions[1].type);
  }

  it('should log #logSearchboxSubmit when #q parameter changes', () => {
    expectIdenticalActionType(
      legacyLogParametersChange({}, {q: 'test'}),
      logSearchboxSubmit()
    );
  });

  it('should log #logResultsSort when #sortCriteria parameter changes', () => {
    expectIdenticalActionType(
      legacyLogParametersChange({}, {sortCriteria: 'size ascending'}),
      logResultsSort()
    );
  });

  it('should log #logPageNumber when #firstResult parameter changes', () => {
    expectIdenticalActionType(
      legacyLogParametersChange({}, {firstResult: 10}),
      logPageNumber()
    );
  });

  it('should log #logPagerResize when #firstResult parameter changes', () => {
    expectIdenticalActionType(
      legacyLogParametersChange({}, {numberOfResults: 25}),
      logPagerResize()
    );
  });

  legacyTestFacetSelectLogging('f', expectIdenticalActionType);

  legacyTestFacetSelectLogging('af', expectIdenticalActionType);

  legacyTestFacetSelectLogging('cf', expectIdenticalActionType);

  legacyTestFacetExcludeLogging(expectIdenticalActionType);

  it('should log a generic #logInterfaceChange when an unmanaged parameter', () => {
    expectIdenticalActionType(
      legacyLogParametersChange({}, {cq: 'hello'}),
      logInterfaceChange()
    );
  });
});

function legacyTestFacetSelectLogging(
  parameter: string,
  expectIdenticalActionType: (
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) => void
) {
  legacyTestFacetLogging(parameter, expectIdenticalActionType);

  it(`should log #logFacetSelect when an ${parameter} parameter is added`, () => {
    expectIdenticalActionType(
      legacyLogParametersChange({}, {[parameter]: {author: ['Cervantes']}}),
      logFacetSelect({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it(`should log #logFacetSelect when an ${parameter} parameter is modified & a value added`, () => {
    expectIdenticalActionType(
      legacyLogParametersChange(
        {[parameter]: {author: ['Cervantes']}},
        {[parameter]: {author: ['Cervantes', 'Orwell']}}
      ),
      logFacetSelect({facetId: 'author', facetValue: 'Orwell'})
    );
  });
}

function legacyTestFacetExcludeLogging(
  expectIdenticalActionType: (
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) => void
) {
  legacyTestFacetLogging('fExcluded', expectIdenticalActionType);

  it('should log #logFacetSelect when an fExcluded parameter is added', () => {
    expectIdenticalActionType(
      legacyLogParametersChange({}, {fExcluded: {author: ['Cervantes']}}),
      logFacetExclude({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it('should log #logFacetSelect when an fExcluded parameter is modified & a value added', () => {
    expectIdenticalActionType(
      legacyLogParametersChange(
        {fExcluded: {author: ['Cervantes']}},
        {fExcluded: {author: ['Cervantes', 'Orwell']}}
      ),
      logFacetExclude({facetId: 'author', facetValue: 'Orwell'})
    );
  });
}

function legacyTestFacetLogging(
  parameter: string,
  expectIdenticalActionType: (
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) => void
) {
  it(`should log #logFacetDeselect when an ${parameter} parameter with a single value is removed`, () => {
    expectIdenticalActionType(
      legacyLogParametersChange({[parameter]: {author: ['Cervantes']}}, {}),
      logFacetDeselect({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it(`should log #logFacetClearAll when an ${parameter} parameter with multiple values is removed`, () => {
    expectIdenticalActionType(
      legacyLogParametersChange(
        {[parameter]: {author: ['Cervantes', 'Orwell']}},
        {}
      ),
      logFacetClearAll('author')
    );
  });

  it(`should log #logFacetDeselect when an ${parameter} parameter is modified & a value removed`, () => {
    expectIdenticalActionType(
      legacyLogParametersChange(
        {[parameter]: {author: ['Cervantes', 'Orwell']}},
        {[parameter]: {author: ['Cervantes']}}
      ),
      logFacetDeselect({facetId: 'author', facetValue: 'Orwell'})
    );
  });
}

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
const ANY_FACET_ID = 'author';
const ANY_FACET_VALUE = 'Cervantes';

function testFacetExcludeLogging() {
  testFacetSelectLogging('fExcluded');

  it('should log #logFacetSelect when an fExcluded parameter is added', () => {
    const action = parametersChange({}, {fExcluded: {author: ['Cervantes']}});

    expect(action.actionCause).toEqual(
      facetExclude(ANY_FACET_ID, ANY_FACET_VALUE).actionCause
    );
  });

  it('should log #logFacetSelect when an fExcluded parameter is modified & a value added', () => {
    const action = parametersChange(
      {fExcluded: {author: ['Cervantes']}},
      {fExcluded: {author: ['Cervantes', 'Orwell']}}
    );

    expect(action.actionCause).toEqual(
      facetExclude(ANY_FACET_ID, ANY_FACET_VALUE).actionCause
    );
  });
}

describe('parametersChange', () => {
  it('should log #logSearchboxSubmit when #q parameter changes', () => {
    const action = parametersChange({}, {q: 'test'});

    expect(action.actionCause).toEqual(searchboxSubmit().actionCause);
  });

  it('should log #resultsSort when #sortCriteria parameter changes', () => {
    const action = parametersChange({}, {sortCriteria: 'size ascending'});

    expect(action.actionCause).toEqual(resultsSort().actionCause);
  });

  it('should log #logPageNumber when #firstResult parameter changes', () => {
    // expectIdenticalActionType(
    //   legacyLogParametersChange({}, {firstResult: 10}),
    //   logPageNumber()
    // );
  });

  it('should log #logPagerResize when #firstResult parameter changes', () => {
    // expectIdenticalActionType(
    //   legacyLogParametersChange({}, {numberOfResults: 25}),
    //   logPagerResize()
    // );
  });

  testFacetSelectLogging('f');

  testFacetSelectLogging('af');

  testFacetSelectLogging('cf');

  testFacetExcludeLogging();

  it('should log a generic #logInterfaceChange when an unmanaged parameter', () => {
    const action = parametersChange({}, {cq: 'hello'});

    expect(action.actionCause).toEqual(interfaceChange().actionCause);
  });
});

function testFacetSelectLogging(parameter: string) {
  it(`should log #logFacetDeselect when an ${parameter} parameter with a single value is removed`, () => {
    const action = parametersChange({[parameter]: {author: ['Cervantes']}}, {});

    expect(action.actionCause).toEqual(
      facetDeselect(ANY_FACET_ID, ANY_FACET_VALUE).actionCause
    );
  });

  it(`should log #logFacetClearAll when an ${parameter} parameter with multiple values is removed`, () => {
    const action = parametersChange(
      {[parameter]: {author: ['Cervantes', 'Orwell']}},
      {}
    );

    expect(action.actionCause).toEqual(facetClearAll(ANY_FACET_ID).actionCause);
  });

  it(`should log #logFacetDeselect when an ${parameter} parameter is modified & a value removed`, () => {
    const action = parametersChange(
      {[parameter]: {author: ['Cervantes', 'Orwell']}},
      {[parameter]: {author: ['Cervantes']}}
    );

    expect(action.actionCause).toEqual(
      facetDeselect(ANY_FACET_ID, ANY_FACET_VALUE).actionCause
    );
  });
}
