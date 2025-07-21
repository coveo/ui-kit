import {
  interfaceChange,
  logInterfaceChange,
} from '../analytics/analytics-actions.js';
import type {LegacySearchAction} from '../analytics/analytics-utils.js';
import {
  facetClearAll,
  facetDeselect,
  facetExclude,
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetUnexclude,
} from '../facets/facet-set/facet-set-analytics-actions.js';
import {
  logPageNumber,
  logPagerResize,
} from '../pagination/pagination-analytics-actions.js';
import {
  logSearchboxSubmit,
  searchboxSubmit,
} from '../query/query-analytics-actions.js';
import {
  logResultsSort,
  resultsSort,
} from '../sort-criteria/sort-criteria-analytics-actions.js';
import {
  legacyLogParametersChange,
  parametersChange,
} from './search-parameter-analytics-actions.js';
import {logParametersChange} from './search-parameter-insight-analytics-actions.js';

describe('legacyLogParametersChange', () => {
  function expectIdenticalActionType(
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) {
    expect(action1.typePrefix).toEqual(action2.typePrefix);
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
  it('should log #logFacetUnexclude when an fExcluded parameter with a single value is removed', () => {
    expectIdenticalActionType(
      logParametersChange({fExcluded: {author: ['Cervantes']}}, {}),
      logFacetUnexclude({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it('should log #logFacetClearAll when an fExcluded parameter with multiple values is removed', () => {
    expectIdenticalActionType(
      logParametersChange({fExcluded: {author: ['Cervantes', 'Orwell']}}, {}),
      logFacetClearAll('author')
    );
  });

  it('should log #logFacetUnexclude when an fExcluded parameter is modified & a value removed', () => {
    expectIdenticalActionType(
      logParametersChange(
        {fExcluded: {author: ['Cervantes', 'Orwell']}},
        {fExcluded: {author: ['Cervantes']}}
      ),
      logFacetUnexclude({facetId: 'author', facetValue: 'Orwell'})
    );
  });

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
function testFacetExcludeLogging() {
  testFacetSelectLogging('fExcluded');

  it('should log #facetSelect when an fExcluded parameter is added', () => {
    const action = parametersChange({}, {fExcluded: {author: ['Cervantes']}});

    expect(action.actionCause).toEqual(facetExclude().actionCause);
  });

  it('should log #facetSelect when an fExcluded parameter is modified & a value added', () => {
    const action = parametersChange(
      {fExcluded: {author: ['Cervantes']}},
      {fExcluded: {author: ['Cervantes', 'Orwell']}}
    );

    expect(action.actionCause).toEqual(facetExclude().actionCause);
  });
}

describe('parametersChange', () => {
  it('should log #searchboxSubmit when #q parameter changes', () => {
    const action = parametersChange({}, {q: 'test'});

    expect(action.actionCause).toEqual(searchboxSubmit().actionCause);
  });

  it('should log #resultsSort when #sortCriteria parameter changes', () => {
    const action = parametersChange({}, {sortCriteria: 'size ascending'});

    expect(action.actionCause).toEqual(resultsSort().actionCause);
  });

  testFacetSelectLogging('f');

  testFacetSelectLogging('af');

  testFacetSelectLogging('cf');

  testFacetExcludeLogging();

  it('should log a generic #interfaceLoad when an unmanaged parameter', () => {
    const action = parametersChange({}, {cq: 'hello'});

    expect(action.actionCause).toEqual(interfaceChange().actionCause);
  });
});

function testFacetSelectLogging(parameter: string) {
  it(`should log #facetDeselect when an ${parameter} parameter with a single value is removed`, () => {
    const action = parametersChange({[parameter]: {author: ['Cervantes']}}, {});

    expect(action.actionCause).toEqual(facetDeselect().actionCause);
  });

  it(`should log #facetClearAll when an ${parameter} parameter with multiple values is removed`, () => {
    const action = parametersChange(
      {[parameter]: {author: ['Cervantes', 'Orwell']}},
      {}
    );

    expect(action.actionCause).toEqual(facetClearAll().actionCause);
  });

  it(`should log #facetDeselect when an ${parameter} parameter is modified & a value removed`, () => {
    const action = parametersChange(
      {[parameter]: {author: ['Cervantes', 'Orwell']}},
      {[parameter]: {author: ['Cervantes']}}
    );

    expect(action.actionCause).toEqual(facetDeselect().actionCause);
  });
}
