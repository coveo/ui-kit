import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor, act} from '@testing-library/react';
import type {PageSizeProps, PaginationProps, SortProps} from '@coveo/thermidor-schema';
import {mountSurface} from './mount-surface.harness.js';

afterEach(cleanup);

/**
 * The three paging/sorting controls each hold a SCALAR: the chosen option or the current page.
 * Each is asserted while its dispatch is deliberately left outstanding, which is the only window
 * in which the optimistic intent stands before the producer reconciles.
 */
function mountControl<TProps extends object>(
  component: string,
  state: TProps,
  dispatchGate?: () => Promise<void> | void
) {
  return mountSurface({
    component: {
      component,
      ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
    },
    dispatchGate,
    dataModel: (Object.keys(state) as Array<keyof TProps>).map((key) => ({
      path: `/state/root/${String(key)}`,
      value: state[key],
    })),
  });
}

function heldOpen() {
  let answer!: () => void;
  const pending = new Promise<void>((resolve) => (answer = resolve));
  return {gate: () => pending, answer: () => answer()};
}

/**
 * Mounts a control with one answer held per dispatch, so a burst of changes faster than the
 * backend reconciles leaves the first request in flight while the rest queue. `release` settles
 * one held dispatch at a time; `contexts` is the ordered context of every action actually sent.
 */
function mountHeldControl<TProps extends object>(
  component: string,
  state: TProps,
  pick: (context: Record<string, unknown> | undefined) => unknown
) {
  const answers: Array<() => void> = [];
  const view = mountControl(
    component,
    state,
    () => new Promise<void>((resolve) => answers.push(resolve))
  );
  return {
    ...view,
    sent: () => view.actions.map((action) => pick(action.context)),
    release: async () => {
      await act(async () => {
        answers.shift()?.();
        await Promise.resolve();
      });
    },
  };
}

describe('Pagination', () => {
  const state: PaginationProps = {page: 0, pageSize: 12, totalEntries: 60, totalPages: 5};

  it('optimistically marks the clicked page current before the backend reconciles', async () => {
    const held = heldOpen();
    const {lastAction} = mountControl('Pagination', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText('Page 3')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Page 3'));

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 2}})
    );
    expect(screen.getByLabelText('Page 3').getAttribute('aria-current')).toBe('page');
    expect(screen.getByLabelText('Page 1').getAttribute('aria-current')).toBeNull();
    held.answer();
  });

  it('sends only the first and last page of a rapid burst, coalescing the queue', async () => {
    const view = mountHeldControl('Pagination', state, (context) => context?.['page']);

    await waitFor(() => expect(screen.getByLabelText('Page 2')).toBeDefined());
    // Click through the pages faster than the backend answers.
    fireEvent.click(screen.getByLabelText('Page 2'));
    fireEvent.click(screen.getByLabelText('Page 3'));
    fireEvent.click(screen.getByLabelText('Page 4'));
    fireEvent.click(screen.getByLabelText('Page 5'));

    // Only the first dispatch (page 2 -> page:1) is in flight; the rest queue on the one slot.
    await waitFor(() => expect(view.sent()).toEqual([1]));
    await view.release();

    // The middle selections never go out: the queue coalesces to the latest (page 5 -> page:4).
    await waitFor(() => expect(view.sent()).toEqual([1, 4]));
  });
});

describe('PageSize', () => {
  const state: PageSizeProps = {pageSize: 12};

  it('optimistically shows the chosen size before the backend reconciles', async () => {
    const held = heldOpen();
    const {lastAction} = mountControl('PageSize', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    const select = screen.getByLabelText(/Products per page/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '48'}});

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'setPageSize', context: {pageSize: 48}})
    );
    expect((screen.getByLabelText(/Products per page/) as HTMLSelectElement).value).toBe('48');
    held.answer();
  });

  it('sends only the first and last size of a rapid burst, coalescing the queue', async () => {
    // `pageSize: 96` folds a fourth option into the default [12, 24, 48] list.
    const view = mountHeldControl<PageSizeProps>(
      'PageSize',
      {pageSize: 96},
      (context) => context?.['pageSize']
    );

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    const select = screen.getByLabelText(/Products per page/) as HTMLSelectElement;
    // Change through the sizes faster than the backend answers.
    fireEvent.change(select, {target: {value: '12'}});
    fireEvent.change(select, {target: {value: '24'}});
    fireEvent.change(select, {target: {value: '48'}});

    // Only the first dispatch (12) is in flight; the rest queue on the one slot.
    await waitFor(() => expect(view.sent()).toEqual([12]));
    await view.release();

    // The middle selection (24) never goes out: the queue coalesces to the latest (48).
    await waitFor(() => expect(view.sent()).toEqual([12, 48]));
  });
});

describe('Sort', () => {
  const state: SortProps = {
    appliedSort: {sortCriteria: 'relevance', fields: []},
    availableSorts: [
      {sortCriteria: 'relevance', fields: []},
      {sortCriteria: 'price_asc', fields: []},
    ],
  };

  it('optimistically shows the chosen criterion before the backend reconciles', async () => {
    const held = heldOpen();
    const {lastAction} = mountControl('Sort', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText(/Sort by/)).toBeDefined());
    const select = screen.getByLabelText(/Sort by/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '1'}});

    await waitFor(() =>
      expect(lastAction()).toMatchObject({
        name: 'selectSort',
        context: {sortCriteria: 'price_asc'},
      })
    );
    expect((screen.getByLabelText(/Sort by/) as HTMLSelectElement).value).toBe('1');
    held.answer();
  });

  it('sends only the first and last criterion of a rapid burst, coalescing the queue', async () => {
    const fourSorts: SortProps = {
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [
        {sortCriteria: 'relevance', fields: []},
        {sortCriteria: 'price_asc', fields: []},
        {sortCriteria: 'price_desc', fields: []},
        {sortCriteria: 'name_asc', fields: []},
      ],
    };
    const view = mountHeldControl('Sort', fourSorts, (context) => context?.['sortCriteria']);

    await waitFor(() => expect(screen.getByLabelText(/Sort by/)).toBeDefined());
    const select = screen.getByLabelText(/Sort by/) as HTMLSelectElement;
    // Change through the criteria faster than the backend answers (by option index).
    fireEvent.change(select, {target: {value: '1'}});
    fireEvent.change(select, {target: {value: '2'}});
    fireEvent.change(select, {target: {value: '3'}});

    // Only the first dispatch (price_asc) is in flight; the rest queue on the one slot.
    await waitFor(() => expect(view.sent()).toEqual(['price_asc']));
    await view.release();

    // The middle selection (price_desc) never goes out: the queue coalesces to the latest.
    await waitFor(() => expect(view.sent()).toEqual(['price_asc', 'name_asc']));
  });
});
