import {searchHubReducer} from './search-hub-slice';
import {setSearchHub} from './search-hub-actions';
import {change} from '../history/history-actions';
import {getHistoryEmptyState} from '../history/history-slice';
import {updateSearchConfiguration} from '../configuration/configuration-actions';
import {getSearchHubInitialState} from './search-hub-state';

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
      ...getHistoryEmptyState(),
      searchHub: 'bar',
    };

    const nextState = searchHubReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState).toEqual('bar');
  });
});
