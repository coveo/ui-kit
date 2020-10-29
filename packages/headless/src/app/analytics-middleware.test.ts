import {executeSearch} from '../features/search/search-actions';
import {buildMockSearch} from '../test/mock-search';
import {buildMockSearchAppEngine} from '../test/mock-engine';
import {logSearchboxSubmit} from '../features/query/query-analytics-actions';

describe('analytics middleware', () => {
  beforeEach(() => {
    // silence console errors for these tests since we know it will report errors for missing analytics
    console.error = jest.fn();
  });

  it('correctly pass through anu action with not analytics payload', () => {
    const e = buildMockSearchAppEngine();
    const {dispatch, store} = e;

    const action = {type: 'foo'};
    dispatch(action);
    expect(store.getActions()).toContain(action);
  });

  it('correctly pass through a search action with no analytics payload', () => {
    const e = buildMockSearchAppEngine();
    const {dispatch, store} = e;
    const {analyticsAction, ...mockSearchWithoutAnalytics} = buildMockSearch();

    const action = executeSearch.fulfilled(
      mockSearchWithoutAnalytics as any,
      '',
      null as any
    );
    dispatch(action);
    expect(store.getActions()).toContain(action);
  });

  it('correctly pass through a search action with an analytics payload', () => {
    const e = buildMockSearchAppEngine();
    const {dispatch, store} = e;
    const mockSearch = buildMockSearch();

    const action = executeSearch.fulfilled(
      mockSearch,
      '',
      logSearchboxSubmit()
    );
    dispatch(action);
    expect(store.getActions()).toContain(action);
  });

  it('correctly queue log analytics after search action', () => {
    const e = buildMockSearchAppEngine();
    const {dispatch, store} = e;
    const mockSearch = buildMockSearch();

    const action = executeSearch.fulfilled(
      mockSearch,
      '',
      logSearchboxSubmit()
    );
    dispatch(action);
    expect(store.getActions()[0].type).toBe(executeSearch.fulfilled.type);
    expect(store.getActions()[1].type).toBe(logSearchboxSubmit.pending.type);
  });

  it('correctly remove analytics payload from action', () => {
    const e = buildMockSearchAppEngine();
    const {dispatch, store} = e;
    const mockSearch = buildMockSearch();

    const action = executeSearch.fulfilled(
      mockSearch,
      '',
      logSearchboxSubmit()
    );
    dispatch(action);
    expect(store.getActions()[0].payload).toBeDefined();
    expect(store.getActions()[0].payload.analyticsAction).not.toBeDefined();
  });
});
