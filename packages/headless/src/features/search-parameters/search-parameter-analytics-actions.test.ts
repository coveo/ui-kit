import {buildMockSearchAppEngine} from '../../test';
import {logInterfaceChange} from '../analytics/analytics-actions';
import {LegacySearchAction} from '../analytics/analytics-utils';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetExclude,
} from '../facets/facet-set/facet-set-analytics-actions';
import {
  logPageNumber,
  logPagerResize,
} from '../pagination/pagination-analytics-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {logResultsSort} from '../sort-criteria/sort-criteria-analytics-actions';
import {logParametersChange} from './search-parameter-analytics-actions';

describe('logParametersChange', () => {
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
      logParametersChange({}, {q: 'test'}),
      logSearchboxSubmit()
    );
  });

  it('should log #logResultsSort when #sortCriteria parameter changes', () => {
    expectIdenticalActionType(
      logParametersChange({}, {sortCriteria: 'size ascending'}),
      logResultsSort()
    );
  });

  it('should log #logPageNumber when #firstResult parameter changes', () => {
    expectIdenticalActionType(
      logParametersChange({}, {firstResult: 10}),
      logPageNumber()
    );
  });

  it('should log #logPagerResize when #firstResult parameter changes', () => {
    expectIdenticalActionType(
      logParametersChange({}, {numberOfResults: 25}),
      logPagerResize()
    );
  });

  testFacetSelectLogging('f', expectIdenticalActionType);

  testFacetSelectLogging('af', expectIdenticalActionType);

  testFacetSelectLogging('cf', expectIdenticalActionType);

  testFacetExcludeLogging(expectIdenticalActionType);

  it('should log a generic #logInterfaceChange when an unmanaged parameter', () => {
    expectIdenticalActionType(
      logParametersChange({}, {cq: 'hello'}),
      logInterfaceChange()
    );
  });
});

function testFacetSelectLogging(
  parameter: string,
  expectIdenticalActionType: (
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) => void
) {
  testFacetLogging(parameter, expectIdenticalActionType);

  it(`should log #logFacetSelect when an ${parameter} parameter is added`, () => {
    expectIdenticalActionType(
      logParametersChange({}, {[parameter]: {author: ['Cervantes']}}),
      logFacetSelect({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it(`should log #logFacetSelect when an ${parameter} parameter is modified & a value added`, () => {
    expectIdenticalActionType(
      logParametersChange(
        {[parameter]: {author: ['Cervantes']}},
        {[parameter]: {author: ['Cervantes', 'Orwell']}}
      ),
      logFacetSelect({facetId: 'author', facetValue: 'Orwell'})
    );
  });
}

function testFacetExcludeLogging(
  expectIdenticalActionType: (
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) => void
) {
  testFacetLogging('fExcluded', expectIdenticalActionType);

  it('should log #logFacetSelect when an fExcluded parameter is added', () => {
    expectIdenticalActionType(
      logParametersChange({}, {fExcluded: {author: ['Cervantes']}}),
      logFacetExclude({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it('should log #logFacetSelect when an fExcluded parameter is modified & a value added', () => {
    expectIdenticalActionType(
      logParametersChange(
        {fExcluded: {author: ['Cervantes']}},
        {fExcluded: {author: ['Cervantes', 'Orwell']}}
      ),
      logFacetExclude({facetId: 'author', facetValue: 'Orwell'})
    );
  });
}

function testFacetLogging(
  parameter: string,
  expectIdenticalActionType: (
    action1: LegacySearchAction,
    action2: LegacySearchAction
  ) => void
) {
  it(`should log #logFacetDeselect when an ${parameter} parameter with a single value is removed`, () => {
    expectIdenticalActionType(
      logParametersChange({[parameter]: {author: ['Cervantes']}}, {}),
      logFacetDeselect({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it(`should log #logFacetClearAll when an ${parameter} parameter with multiple values is removed`, () => {
    expectIdenticalActionType(
      logParametersChange({[parameter]: {author: ['Cervantes', 'Orwell']}}, {}),
      logFacetClearAll('author')
    );
  });

  it(`should log #logFacetDeselect when an ${parameter} parameter is modified & a value removed`, () => {
    expectIdenticalActionType(
      logParametersChange(
        {[parameter]: {author: ['Cervantes', 'Orwell']}},
        {[parameter]: {author: ['Cervantes']}}
      ),
      logFacetDeselect({facetId: 'author', facetValue: 'Orwell'})
    );
  });
}
