import {buildMockOmniboxSuggestionMetadata} from '../../test/mock-omnibox-suggestion-metadata';
import {buildMockStandaloneSearchBoxEntry} from '../../test/mock-standalone-search-box-entry';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  updateAnalyticsToOmniboxFromLink,
  updateAnalyticsToSearchFromLink,
} from './standalone-search-box-set-actions';
import {standaloneSearchBoxSetReducer} from './standalone-search-box-set-slice';
import {StandaloneSearchBoxSetState} from './standalone-search-box-set-state';

describe('standalone search box slice', () => {
  const id = '1';
  let state: StandaloneSearchBoxSetState;

  beforeEach(() => {
    state = {
      [id]: buildMockStandaloneSearchBoxEntry(),
    };
  });

  it('initializes the state to an empty object', () => {
    const finalState = standaloneSearchBoxSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  describe('#registerStandaloneSearchBox', () => {
    it('when the id does not exist, it registers the payload in the set', () => {
      const id = 'new id';
      const redirectionUrl = 'url';
      const action = registerStandaloneSearchBox({id, redirectionUrl});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]).toEqual(
        buildMockStandaloneSearchBoxEntry({
          defaultRedirectionUrl: redirectionUrl,
        })
      );
    });

    it('when the id exists, it does not register the payload', () => {
      const action = registerStandaloneSearchBox({id, redirectionUrl: 'url'});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(state[id]).toEqual(finalState[id]);
    });
  });

  describe('#fetchRedirectUrl.pending', () => {
    it('when the id exists, it sets isLoading to true', () => {
      const action = fetchRedirectUrl.pending('', {id});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.isLoading).toBe(true);
    });

    it('when the id does not exist, it does not throw', () => {
      const action = fetchRedirectUrl.pending('', {id: 'invalid'});
      expect(() => standaloneSearchBoxSetReducer(state, action)).not.toThrow();
    });
  });

  describe('#fetchRedirectUrl.rejected', () => {
    it('when the id exists, it sets isLoading to false', () => {
      state[id]!.isLoading = true;

      const action = fetchRedirectUrl.rejected(null, '', {id});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.isLoading).toBe(false);
    });

    it('when the id does not exist, it does not throw', () => {
      const action = fetchRedirectUrl.rejected(null, '', {id: 'invalid'});
      expect(() => standaloneSearchBoxSetReducer(state, action)).not.toThrow();
    });
  });

  describe('#fetchRedirectUrl.fulfilled', () => {
    it(`when the id exists, and the payload url is non-empty string,
    it sets #redirectTo to the payload value`, () => {
      const url = '/search-page';
      const action = fetchRedirectUrl.fulfilled(url, '', {id});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.redirectTo).toBe(url);
    });

    it(`when the id exists, and the payload url is an empty string,
    it sets #redirectTo to the default redirection url`, () => {
      const url = '/search-page';
      state[id] = buildMockStandaloneSearchBoxEntry({
        defaultRedirectionUrl: url,
      });

      const action = fetchRedirectUrl.fulfilled('', '', {id});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.redirectTo).toBe(url);
    });

    it('sets #isLoading to false', () => {
      state[id] = buildMockStandaloneSearchBoxEntry({isLoading: true});

      const action = fetchRedirectUrl.fulfilled('', '', {id});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.isLoading).toBe(false);
    });

    it('when the id does not exist, it does not throw', () => {
      const action = fetchRedirectUrl.fulfilled('', '', {id: 'invalid url'});
      expect(() => standaloneSearchBoxSetReducer(state, action)).not.toThrow();
    });
  });

  describe('#updateAnalyticsToSearchFromLink', () => {
    it('when the id exists, it sets the analytics cause to searchFromLink', () => {
      const action = updateAnalyticsToSearchFromLink({id});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.analytics.cause).toBe('searchFromLink');
    });

    it('when the id does not exist, it does not throw', () => {
      const action = updateAnalyticsToSearchFromLink({id: 'invalid id'});
      expect(() => standaloneSearchBoxSetReducer(state, action)).not.toThrow();
    });
  });

  describe('#updateAnalyticsToOmniboxFromLink', () => {
    it('when the id exists, it sets the analytics cause to omniboxFromLink and stores the payload metadata', () => {
      const metadata = buildMockOmniboxSuggestionMetadata();
      const action = updateAnalyticsToOmniboxFromLink({id, metadata});
      const finalState = standaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.analytics.cause).toBe('omniboxFromLink');
      expect(finalState[id]!.analytics.metadata).toEqual(metadata);
    });

    it('when the id does not exist, it does not throw', () => {
      const metadata = buildMockOmniboxSuggestionMetadata();
      const action = updateAnalyticsToOmniboxFromLink({
        id: 'invalid id',
        metadata,
      });
      expect(() => standaloneSearchBoxSetReducer(state, action)).not.toThrow();
    });
  });
});
