import {updateSearchConfiguration} from '../configuration/configuration-actions.js';
import {change} from '../history/history-actions.js';
import {getHistoryInitialState} from '../history/history-state.js';
import {setSearchHub} from './search-hub-actions.js';
import {searchHubReducer} from './search-hub-slice.js';
import {getSearchHubInitialState} from './search-hub-state.js';

describe('search hub slice', () => {
  it('should have initial state', () => {
    expect(searchHubReducer(undefined, {type: 'randomAction'})).toEqual(
      getSearchHubInitialState()
    );
  });

  it('allows to set a search hub', () => {
    expect(searchHubReducer('foo', setSearchHub('bar'))).toBe('bar');
  });

  it('allows to set a search hub through configuration', () => {
    expect(
      searchHubReducer('foo', updateSearchConfiguration({searchHub: 'bar'}))
    ).toEqual('bar');
  });

  it('allows to restore a search hub on history change', () => {
    const state = 'foo';
    const historyChange = {
      ...getHistoryInitialState(),
      searchHub: 'bar',
    };

    const nextState = searchHubReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState).toEqual('bar');
  });
});
