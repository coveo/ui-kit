import {Action} from 'redux';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {restoreSearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {executeSearch} from '../../features/search/search-actions';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test';
import {getInitialSearchParameterState} from '../search-parameter-manager/headless-search-parameter-manager';
import {
  UrlHashManagerProps,
  UrlHashManager,
  buildUrlHashManager,
} from './headless-url-hash-manager';

describe('url hash manager', () => {
  let engine: MockEngine<SearchAppState>;
  let props: UrlHashManagerProps;
  let manager: UrlHashManager;

  function initUrlHashManager() {
    manager = buildUrlHashManager(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    props = {
      initialState: {
        urlHash: '#',
      },
    };

    initUrlHashManager();
  });

  function searchAnalyticsAction() {
    return engine.findAsyncAction(executeSearch.pending)!.meta.arg.toString();
  }

  function expectLatestRestoreSearchParametersActionToBe(action: Action) {
    const restoreSearchParametersActions = engine.actions.filter(
      (action) => action.type === restoreSearchParameters.type
    );
    expect(
      restoreSearchParametersActions[restoreSearchParametersActions.length - 1]
    ).toEqual(action);
  }

  describe('initialization', () => {
    it('dispatches #restoreSearchParameters on registration', () => {
      const action = restoreSearchParameters(
        getInitialSearchParameterState(engine)
      );
      expectLatestRestoreSearchParametersActionToBe(action);
    });

    it('when #parameters is not an object, it throws an error', () => {
      props.initialState.urlHash = 'not an hash';
      expect(() => initUrlHashManager()).toThrow(
        'Check the initialState of buildUrlHashManager'
      );
    });
  });

  describe('#updateUrlHash with query parameter', () => {
    it(`when adding a q parameter
    should restore the right parameters and log the right analytics`, () => {
      const action = restoreSearchParameters({
        ...getInitialSearchParameterState(engine),
        q: 'test',
      });
      manager.updateUrlHash('#q=test');
      expectLatestRestoreSearchParametersActionToBe(action);
      expect(searchAnalyticsAction()).toBe(logSearchboxSubmit().toString());
    });

    it(`when removing a q parameter
    should restore the right parameters and log the right analytics`, () => {
      engine.state.query.q = 'test';
      const action = restoreSearchParameters(
        getInitialSearchParameterState(engine)
      );

      manager.updateUrlHash('#');
      expectLatestRestoreSearchParametersActionToBe(action);
      expect(searchAnalyticsAction()).toBe(logSearchboxSubmit().toString());
    });
  });

  describe('#updateUrlHash with sort criteria parameter', () => {
    it(`when adding a sortCriteria parameter
    should restore the right parameters and log the right analytics`, () => {
      const action = restoreSearchParameters({
        ...getInitialSearchParameterState(engine),
        sortCriteria: 'size ascending',
      });
      manager.updateUrlHash('#sortCriteria=size ascending');
      expectLatestRestoreSearchParametersActionToBe(action);
      expect(searchAnalyticsAction()).toBe(logResultsSort().toString());
    });

    it(`when removing a sortCriteria parameter
    should restore the right parameters and log the right analytics`, () => {
      engine.state.sortCriteria = 'size ascending';
      const action = restoreSearchParameters(
        getInitialSearchParameterState(engine)
      );

      manager.updateUrlHash('#');
      expectLatestRestoreSearchParametersActionToBe(action);
      expect(searchAnalyticsAction()).toBe(logResultsSort().toString());
    });
  });

  describe('#updateUrlHash with facet parameter', () => {
    it(`when adding a f parameter
    should restore the right parameters and log the right analytics`, () => {
      const action = restoreSearchParameters({
        ...getInitialSearchParameterState(engine),
        f: {author: ['Cervantes']},
      });

      manager.updateUrlHash('#f[author]=Cervantes');
      expectLatestRestoreSearchParametersActionToBe(action);
      expect(searchAnalyticsAction()).toBe(
        logFacetSelect({facetId: 'author', facetValue: 'Cervantes'}).toString()
      );
    });

    it(`when removing a f parameter
    when there was a single value selected
    should restore the right parameters and log the right analytics`, () => {
      manager.updateUrlHash('#f[author]=Cervantes');
      const action = restoreSearchParameters(
        getInitialSearchParameterState(engine)
      );
      manager.updateUrlHash('#');
      expectLatestRestoreSearchParametersActionToBe(action);
      expect(searchAnalyticsAction()).toBe(
        logFacetDeselect({
          facetId: 'author',
          facetValue: 'Cervantes',
        }).toString()
      );
    });

    it(`when removing a f parameter
    when there was multiple values selected
    should restore the right parameters and log the right analytics`, () => {
      manager.updateUrlHash('#f[author]=Cervantes');
      const action = restoreSearchParameters(
        getInitialSearchParameterState(engine)
      );
      manager.updateUrlHash('#');
      expectLatestRestoreSearchParametersActionToBe(action);
      expect(searchAnalyticsAction()).toBe(
        logFacetClearAll('author').toString()
      );
    });

    // TODO: add more tests
  });
});
