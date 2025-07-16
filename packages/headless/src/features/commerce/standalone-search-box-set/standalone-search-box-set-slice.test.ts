import {buildMockCommerceStandaloneSearchBoxEntry} from '../../../test/mock-commerce-standalone-search-box-entry.js';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
  updateStandaloneSearchBoxRedirectionUrl,
} from './standalone-search-box-set-actions.js';
import {commerceStandaloneSearchBoxSetReducer} from './standalone-search-box-set-slice.js';
import type {CommerceStandaloneSearchBoxSetState} from './standalone-search-box-set-state.js';

describe('commerce standalone search box slice', () => {
  const id = '1';
  let state: CommerceStandaloneSearchBoxSetState;

  beforeEach(() => {
    state = {
      [id]: buildMockCommerceStandaloneSearchBoxEntry(),
    };
  });

  it('initializes the state to an empty object', () => {
    const finalState = commerceStandaloneSearchBoxSetReducer(undefined, {
      type: '',
    });
    expect(finalState).toEqual({});
  });

  describe('#registerStandaloneSearchBox', () => {
    it('when the id does not exist, it registers the payload in the set', () => {
      const id = 'new id';
      const redirectionUrl = 'url';
      const action = registerStandaloneSearchBox({id, redirectionUrl});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]).toEqual(
        buildMockCommerceStandaloneSearchBoxEntry({
          defaultRedirectionUrl: redirectionUrl,
        })
      );
    });

    it('when the id exists, it does not register the payload', () => {
      const action = registerStandaloneSearchBox({id, redirectionUrl: 'url'});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(state[id]).toEqual(finalState[id]);
    });

    it('when the id exists and the overwrite option is true, it registers the payload', () => {
      const action = registerStandaloneSearchBox({
        id,
        redirectionUrl: 'url',
        overwrite: true,
      });
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]).toEqual(
        buildMockCommerceStandaloneSearchBoxEntry({
          defaultRedirectionUrl: 'url',
        })
      );
    });
  });

  describe('#updateStandaloneSearchBoxRedirectionUrl', () => {
    it('when the id exists, it sets the default redirection url', () => {
      const action = updateStandaloneSearchBoxRedirectionUrl({
        id,
        redirectionUrl: '/newpage',
      });
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.defaultRedirectionUrl).toBe('/newpage');
    });

    it('when the id does not exist, it does not edit the state', () => {
      const action = updateStandaloneSearchBoxRedirectionUrl({
        id: 'invalid',
        redirectionUrl: '/newpage',
      });
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState).toBe(state);
    });
  });

  describe('#resetStandaloneSearchBox', () => {
    it('when the id exists, it resets the state except for the "defaultRedirectionUrl"', () => {
      state[id]!.redirectTo = '/newpage';
      state[id]!.defaultRedirectionUrl = '/newpage';
      const action = resetStandaloneSearchBox({id});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]).toEqual(
        buildMockCommerceStandaloneSearchBoxEntry({
          defaultRedirectionUrl: '/newpage',
        })
      );
    });

    it('when the id does not exist, it does not throw', () => {
      const action = resetStandaloneSearchBox({id: 'invalid'});
      expect(() =>
        commerceStandaloneSearchBoxSetReducer(state, action)
      ).not.toThrow();
    });
  });

  describe('#fetchRedirectUrl.pending', () => {
    it('when the id exists, it sets isLoading to true', () => {
      const action = fetchRedirectUrl.pending('', {id});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.isLoading).toBe(true);
    });

    it('when the id does not exist, it does not throw', () => {
      const action = fetchRedirectUrl.pending('', {id: 'invalid'});
      expect(() =>
        commerceStandaloneSearchBoxSetReducer(state, action)
      ).not.toThrow();
    });
  });

  describe('#fetchRedirectUrl.rejected', () => {
    it('when the id exists, it sets isLoading to false', () => {
      state[id]!.isLoading = true;

      const action = fetchRedirectUrl.rejected(null, '', {id});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.isLoading).toBe(false);
    });

    it('when the id does not exist, it does not throw', () => {
      const action = fetchRedirectUrl.rejected(null, '', {id: 'invalid'});
      expect(() =>
        commerceStandaloneSearchBoxSetReducer(state, action)
      ).not.toThrow();
    });
  });

  describe('#fetchRedirectUrl.fulfilled', () => {
    it(`when the id exists, and the payload url is non-empty string,
    it sets #redirectTo to the payload value`, () => {
      const url = '/search-page';
      const action = fetchRedirectUrl.fulfilled(url, '', {id});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.redirectTo).toBe(url);
    });

    it(`when the id exists, and the payload url is an empty string,
    it sets #redirectTo to the default redirection url`, () => {
      const url = '/search-page';
      state[id] = buildMockCommerceStandaloneSearchBoxEntry({
        defaultRedirectionUrl: url,
      });

      const action = fetchRedirectUrl.fulfilled('', '', {id});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.redirectTo).toBe(url);
    });

    it('sets #isLoading to false', () => {
      state[id] = buildMockCommerceStandaloneSearchBoxEntry({isLoading: true});

      const action = fetchRedirectUrl.fulfilled('', '', {id});
      const finalState = commerceStandaloneSearchBoxSetReducer(state, action);

      expect(finalState[id]!.isLoading).toBe(false);
    });

    it('when the id does not exist, it does not throw', () => {
      const action = fetchRedirectUrl.fulfilled('', '', {id: 'invalid url'});
      expect(() =>
        commerceStandaloneSearchBoxSetReducer(state, action)
      ).not.toThrow();
    });
  });
});
