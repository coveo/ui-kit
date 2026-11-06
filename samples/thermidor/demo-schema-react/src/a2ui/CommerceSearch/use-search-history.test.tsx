import {describe, it, expect, afterEach, beforeEach, vi} from 'vitest';
import {act, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

const SURFACE_ID = 'test-surface';

function paginationState(page: number) {
  return {path: '/state/pagination', value: {page, pageSize: 12, totalEntries: 43, totalPages: 4}};
}

function mountSearch(dispatchGate?: () => Promise<void>) {
  return mountSurface({
    dispatchGate,
    component: {component: 'CommerceSearch', mainChild: 'pagination'},
    children: [
      {
        id: 'pagination',
        component: 'Pagination',
        page: {path: '/state/pagination/page'},
        pageSize: {path: '/state/pagination/pageSize'},
        totalEntries: {path: '/state/pagination/totalEntries'},
        totalPages: {path: '/state/pagination/totalPages'},
      },
    ],
    dataModel: [paginationState(0)],
  });
}

function popTo(state: unknown) {
  act(() => {
    window.history.replaceState(state, '');
    window.dispatchEvent(new PopStateEvent('popstate', {state}));
  });
}

describe('useSearchHistory', () => {
  beforeEach(() => {
    window.history.replaceState(null, '');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('records each search the surface settles on as a history entry', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    const {pushDataModel} = mountSearch();

    await waitFor(() => expect(pushState).toHaveBeenCalledTimes(1));
    pushDataModel([paginationState(1)]);

    await waitFor(() => expect(pushState).toHaveBeenCalledTimes(2));
    expect(window.history.state).toEqual({
      thermidorSearch: {surfaceId: SURFACE_ID, snapshot: {query: '', page: 1, pageSize: 12}},
    });
  });

  it('restores the search of an entry the browser goes back to', async () => {
    const {lastAction} = mountSearch();
    await waitFor(() => expect(window.history.state).not.toBeNull());

    const snapshot = {query: 'surf', page: 2, pageSize: 12};
    popTo({thermidorSearch: {surfaceId: SURFACE_ID, snapshot}});

    await waitFor(() => expect(lastAction()?.name).toBe('restoreState'));
    expect(lastAction()?.context).toEqual(snapshot);
  });

  it('ignores the entries of another surface', async () => {
    const {actions} = mountSearch();
    await waitFor(() => expect(window.history.state).not.toBeNull());

    popTo({
      thermidorSearch: {surfaceId: 'other-surface', snapshot: {query: '', page: 0, pageSize: 12}},
    });

    expect(actions).toEqual([]);
  });

  it('updates the restored entry with its answer instead of adding one', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    const {pushDataModel, lastAction} = mountSearch();
    await waitFor(() => expect(pushState).toHaveBeenCalledTimes(1));

    popTo({thermidorSearch: {surfaceId: SURFACE_ID, snapshot: {query: '', page: 3, pageSize: 12}}});
    await waitFor(() => expect(lastAction()?.name).toBe('restoreState'));
    pushDataModel([paginationState(2)]);

    await waitFor(() =>
      expect(window.history.state).toEqual({
        thermidorSearch: {surfaceId: SURFACE_ID, snapshot: {query: '', page: 2, pageSize: 12}},
      })
    );
    expect(pushState).toHaveBeenCalledTimes(1);
  });

  it('drops a queued restore when the browser moves on to another entry', async () => {
    let release = () => {};
    const gate = () =>
      new Promise<void>((resolve) => {
        release = resolve;
      });
    const pushState = vi.spyOn(window.history, 'pushState');
    const {actions, pushDataModel} = mountSearch(gate);
    await waitFor(() => expect(pushState).toHaveBeenCalledTimes(1));

    popTo({thermidorSearch: {surfaceId: SURFACE_ID, snapshot: {query: '', page: 1, pageSize: 12}}});
    await waitFor(() => expect(actions).toHaveLength(1));
    popTo({thermidorSearch: {surfaceId: SURFACE_ID, snapshot: {query: '', page: 2, pageSize: 12}}});
    const other = {
      thermidorSearch: {surfaceId: 'other-surface', snapshot: {query: '', page: 0, pageSize: 12}},
    };
    popTo(other);
    await act(async () => release());
    pushDataModel([paginationState(1)]);

    await waitFor(() => expect(window.history.state).toEqual(other));
    expect(actions.map((action) => action.context)).toEqual([{query: '', page: 1, pageSize: 12}]);
    expect(pushState).toHaveBeenCalledTimes(1);
  });

  it('leaves the history alone when a search answers after the browser moved away', async () => {
    let release = () => {};
    const gate = () =>
      new Promise<void>((resolve) => {
        release = resolve;
      });
    const pushState = vi.spyOn(window.history, 'pushState');
    const {actions, findByRole, pushDataModel} = mountSearch(gate);
    await waitFor(() => expect(pushState).toHaveBeenCalledTimes(1));

    const page2 = await findByRole('button', {name: 'Page 2'});
    act(() => page2.click());
    await waitFor(() => expect(actions).toHaveLength(1));
    popTo(null);
    await act(async () => release());
    pushDataModel([paginationState(1)]);

    await waitFor(() => expect(actions.map((action) => action.name)).toEqual(['selectPage']));
    expect(window.history.state).toBeNull();
    expect(pushState).toHaveBeenCalledTimes(1);
  });

  it('adds an entry for the next search after a restore fails', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    const {lastAction, pushDataModel} = mountSearch(() => Promise.reject(new Error('429')));
    await waitFor(() => expect(pushState).toHaveBeenCalledTimes(1));

    popTo({thermidorSearch: {surfaceId: SURFACE_ID, snapshot: {query: '', page: 3, pageSize: 12}}});
    await waitFor(() => expect(lastAction()?.name).toBe('restoreState'));
    pushDataModel([paginationState(2)]);

    await waitFor(() => expect(pushState).toHaveBeenCalledTimes(2));
  });
});
