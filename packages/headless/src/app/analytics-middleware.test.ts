import {logSearchboxSubmit} from '../features/query/query-analytics-actions';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
} from '../features/search/legacy/search-actions';
import {buildMockSearchAppEngine} from '../test/mock-engine';
import {buildMockLegacySearch} from '../test/mock-search';

describe('analytics middleware', () => {
  beforeEach(() => {
    // silence console errors for these tests since we know it will report errors for missing analytics
    console.error = jest.fn();
  });

  it('correctly pass through any action with no analytics payload', () => {
    const e = buildMockSearchAppEngine();

    const action = {type: 'foo'};
    e.dispatch(action);
    expect(e.actions).toContain(action);
  });

  it('correctly pass through a search action with no analytics payload', () => {
    const e = buildMockSearchAppEngine();
    const {analyticsAction, ...mockSearchWithoutAnalytics} =
      buildMockLegacySearch();

    const action = executeSearch.fulfilled(
      mockSearchWithoutAnalytics as ExecuteSearchThunkReturn,
      '',
      null as never
    );
    e.dispatch(action);
    expect(e.actions).toContain(action);
  });

  it('correctly pass through a search action with an analytics payload', () => {
    const e = buildMockSearchAppEngine();
    const mockSearch = buildMockLegacySearch();

    const action = executeSearch.fulfilled(
      mockSearch,
      '',
      logSearchboxSubmit()
    );
    e.dispatch(action);
    expect(e.actions).toContain(action);
  });

  it('correctly queue log analytics after search action', () => {
    const e = buildMockSearchAppEngine();
    const mockSearch = buildMockLegacySearch();

    const action = executeSearch.fulfilled(
      mockSearch,
      '',
      logSearchboxSubmit()
    );
    e.dispatch(action);
    expect(e.actions[0].type).toBe(executeSearch.fulfilled.type);
    expect(e.actions[1].type).toBe(logSearchboxSubmit().pending.type);
  });

  it('correctly remove analytics payload from action', () => {
    const e = buildMockSearchAppEngine();
    const mockSearch = buildMockLegacySearch();

    const action = executeSearch.fulfilled(
      mockSearch,
      '',
      logSearchboxSubmit()
    );
    e.dispatch(action);
    expect(e.actions[0].payload).toBeDefined();
    expect(e.actions[0].payload.analyticsAction).not.toBeDefined();
  });
});
