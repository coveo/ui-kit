import {buildMockSearchAppEngine} from '../../test';
import {logInterfaceChange} from '../analytics/analytics-actions';
import {SearchAction} from '../analytics/analytics-utils';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
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
    action1: SearchAction,
    action2: SearchAction
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

  it('should log #logFacetSelect when an #f parameter is added', () => {
    expectIdenticalActionType(
      logParametersChange({}, {f: {author: ['Cervantes']}}),
      logFacetSelect({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it('should log #logFacetDeselect when an #f parameter with a single value is removed', () => {
    expectIdenticalActionType(
      logParametersChange({f: {author: ['Cervantes']}}, {}),
      logFacetDeselect({facetId: 'author', facetValue: 'Cervantes'})
    );
  });

  it('should log #logFacetClearAll when an #f parameter with a multiple values is removed', () => {
    expectIdenticalActionType(
      logParametersChange({f: {author: ['Cervantes', 'Orwell']}}, {}),
      logFacetClearAll('author')
    );
  });

  it('should log #logFacetSelect when an #f parameter is modified & a value added', () => {
    expectIdenticalActionType(
      logParametersChange(
        {f: {author: ['Cervantes']}},
        {f: {author: ['Cervantes', 'Orwell']}}
      ),
      logFacetSelect({facetId: 'author', facetValue: 'Orwell'})
    );
  });

  it('should log #logFacetDeselect when an #f parameter is modified & a value removed', () => {
    expectIdenticalActionType(
      logParametersChange(
        {f: {author: ['Cervantes', 'Orwell']}},
        {f: {author: ['Cervantes']}}
      ),
      logFacetDeselect({facetId: 'author', facetValue: 'Orwell'})
    );
  });

  it('should log a generic #logInterfaceChange when an unmanaged parameter', () => {
    expectIdenticalActionType(
      logParametersChange({}, {cq: 'hello'}),
      logInterfaceChange()
    );
  });
});
