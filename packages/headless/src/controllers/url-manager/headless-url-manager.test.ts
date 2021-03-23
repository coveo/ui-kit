import {PlatformClient} from '../../api/platform-client';
import {SearchAction} from '../../features/analytics/analytics-utils';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {
  restoreSearchParameters,
  SearchParameters,
} from '../../features/search-parameters/search-parameter-actions';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {getInitialSearchParameterState} from '../search-parameter-manager/headless-search-parameter-manager';
import {UrlManager, buildUrlManager} from './headless-url-manager';

describe('url manager', () => {
  let engine: MockEngine<SearchAppState>;
  let manager: UrlManager;

  function initUrlManager(fragment = '') {
    manager = buildUrlManager(engine, {
      initialState: {
        fragment,
      },
    });
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initUrlManager();
    PlatformClient.call = jest.fn().mockImplementation(() =>
      Promise.resolve({
        body: buildMockSearchResponse(),
      })
    );
  });

  function testAnalyticsAction(action: SearchAction) {
    // TODO: add helper to fnd analytics actions
  }

  function testRestoreSearchParams(newParams: SearchParameters = {}) {
    const action = restoreSearchParameters({
      ...getInitialSearchParameterState(engine),
      ...newParams,
    });

    const restoreSearchParametersActions = engine.actions.filter(
      (action) => action.type === restoreSearchParameters.type
    );
    expect(
      restoreSearchParametersActions[restoreSearchParametersActions.length - 1]
    ).toEqual(action);
  }

  it('dispatches #restoreSearchParameters on registration', () => {
    testRestoreSearchParams();
  });

  describe('submitChanges with query parameter', () => {
    it(`when adding a q parameter
    should restore the right parameters and log the right analytics`, () => {
      manager.submitChanges('q=test');

      testRestoreSearchParams({q: 'test'});
      testAnalyticsAction(logSearchboxSubmit());
    });

    it(`when removing a q parameter
    should restore the right parameters and log the right analytics`, () => {
      initUrlManager('q=test');

      manager.submitChanges('');
      testRestoreSearchParams();
      testAnalyticsAction(logSearchboxSubmit());
    });
  });

  describe('submitChanges with sort criteria parameter', () => {
    it(`when adding a sortCriteria parameter
    should restore the right parameters and log the right analytics`, () => {
      manager.submitChanges('sortCriteria=size ascending');
      testRestoreSearchParams({sortCriteria: 'size ascending'});
      testAnalyticsAction(logResultsSort());
    });

    it(`when removing a sortCriteria parameter
    should restore the right parameters and log the right analytics`, () => {
      initUrlManager('sortCriteria=size ascending');

      manager.submitChanges('');
      testRestoreSearchParams();
      testAnalyticsAction(logResultsSort());
    });
  });

  describe('submitChanges with facet parameter', () => {
    it(`when adding a f parameter
    should restore the right parameters and log the right analytics`, () => {
      manager.submitChanges('f[author]=Cervantes');
      testRestoreSearchParams({f: {author: ['Cervantes']}});
      testAnalyticsAction(
        logFacetSelect({facetId: 'author', facetValue: 'Cervantes'})
      );
    });

    it(`when removing a f parameter
    when there was a single value selected
    should restore the right parameters and log the right analytics`, () => {
      initUrlManager('f[author]=Cervantes');

      manager.submitChanges('');
      testRestoreSearchParams();
      testAnalyticsAction(
        logFacetDeselect({
          facetId: 'author',
          facetValue: 'Cervantes',
        })
      );
    });

    it(`when removing a f parameter
    when there was multiple values selected
    should restore the right parameters and log the right analytics`, () => {
      initUrlManager('f[author]=Cervantes');

      manager.submitChanges('');
      testRestoreSearchParams();
      testAnalyticsAction(logFacetClearAll('author'));
    });

    it(`when editing a f parameter
    when a value is removed
    should restore the right parameters and log the right analytics`, () => {
      initUrlManager('f[author]=Cervantes,Orwell');

      manager.submitChanges('f[author]=Orwell');
      testRestoreSearchParams({f: {author: ['Orwell']}});
      testAnalyticsAction(
        logFacetDeselect({
          facetId: 'author',
          facetValue: 'Cervantes',
        })
      );
    });

    it(`when editing a f parameter
    when a value is added
    should restore the right parameters and log the right analytics`, () => {
      initUrlManager('f[author]=Cervantes');
      spyOn(engine.store, 'dispatch');

      manager.submitChanges('f[author]=Cervantes,Orwell');
      testRestoreSearchParams({f: {author: ['Cervantes', 'Orwell']}});
      testAnalyticsAction(
        logFacetDeselect({
          facetId: 'author',
          facetValue: 'Orwell',
        })
      );
    });
  });
});
