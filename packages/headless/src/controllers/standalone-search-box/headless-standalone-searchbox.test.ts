import {
  buildStandaloneSearchBox,
  StandaloneSearchBox,
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxProps,
} from './headless-standalone-searchbox';
import {checkForRedirection} from '../../features/redirection/redirection-actions';
import {createMockState} from '../../test/mock-state';
import {updateQuery} from '../../features/query/query-actions';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';

describe('headless standalone searchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockEngine<SearchAppState>;
  let searchBox: StandaloneSearchBox;
  let props: StandaloneSearchBoxProps;

  beforeEach(() => {
    const options: StandaloneSearchBoxOptions = {
      id,
      redirectionUrl: 'https://www.coveo.com/en/search',
      numberOfSuggestions: 10,
    };

    props = {options};

    initState();
    initController();
  });

  function initState() {
    state = createMockState();
    state.redirection.redirectTo = 'coveo.com';
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({id, q: 'some value'});
  }

  function initController() {
    engine = buildMockSearchAppEngine({state});
    searchBox = buildStandaloneSearchBox(engine, props);
  }

  it('when configuring an invalid option, it throws an error', () => {
    props.options.numberOfSuggestions = ('1' as unknown) as number;
    expect(() => initController()).toThrow(
      'Check the options of buildStandaloneSearchBox'
    );
  });

  it('should return the right state', () => {
    expect(searchBox.state).toEqual({
      value: state.querySet[id],
      suggestions: state.querySuggest[id]!.completions.map((completion) => ({
        value: completion.expression,
      })),
      redirectTo: state.redirection.redirectTo,
      isLoading: false,
    });
  });

  describe('when calling submit', () => {
    it('sets the query to the search box value kept in the querySet', () => {
      const expectedQuery = state.querySet[id];
      searchBox.submit();

      expect(engine.actions).toContainEqual(updateQuery({q: expectedQuery}));
    });

    it('should dispatch a checkForRedirection action', () => {
      searchBox.submit();

      const action = engine.actions.find(
        (a) => a.type === checkForRedirection.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
