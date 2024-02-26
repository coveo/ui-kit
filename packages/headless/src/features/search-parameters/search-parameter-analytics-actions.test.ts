import {interfaceChange} from '../analytics/analytics-actions';
import {
  facetClearAll,
  facetDeselect,
  facetExclude,
} from '../facets/facet-set/facet-set-analytics-actions';
import {searchboxSubmit} from '../query/query-analytics-actions';
import {resultsSort} from '../sort-criteria/sort-criteria-analytics-actions';
import {parametersChange} from './search-parameter-analytics-actions';

const ANY_FACET_ID = 'author';
const ANY_FACET_VALUE = 'Cervantes';

function testFacetExcludeLogging() {
  testFacetSelectLogging('fExcluded');

  it('should log #facetSelect when an fExcluded parameter is added', () => {
    const action = parametersChange({}, {fExcluded: {author: ['Cervantes']}});

    expect(action.actionCause).toEqual(
      facetExclude(ANY_FACET_ID, ANY_FACET_VALUE).actionCause
    );
  });

  it('should log #facetSelect when an fExcluded parameter is modified & a value added', () => {
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

    expect(action.actionCause).toEqual(
      facetDeselect(ANY_FACET_ID, ANY_FACET_VALUE).actionCause
    );
  });

  it(`should log #facetClearAll when an ${parameter} parameter with multiple values is removed`, () => {
    const action = parametersChange(
      {[parameter]: {author: ['Cervantes', 'Orwell']}},
      {}
    );

    expect(action.actionCause).toEqual(facetClearAll(ANY_FACET_ID).actionCause);
  });

  it(`should log #facetDeselect when an ${parameter} parameter is modified & a value removed`, () => {
    const action = parametersChange(
      {[parameter]: {author: ['Cervantes', 'Orwell']}},
      {[parameter]: {author: ['Cervantes']}}
    );

    expect(action.actionCause).toEqual(
      facetDeselect(ANY_FACET_ID, ANY_FACET_VALUE).actionCause
    );
  });
}
