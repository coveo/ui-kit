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

/**
 * A dispatch held open until `answer()`, so a test can observe the optimistic intent while the
 * producer has not reconciled, then release it inside `act` and assert the producer value returns.
 */
function heldOpen() {
  let answer!: () => void;
  const pending = new Promise<void>((resolve) => (answer = resolve));
  return {
    gate: () => pending,
    answer: async () => {
      await act(async () => {
        answer();
        await Promise.resolve();
      });
    },
  };
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

    // Releasing the producer answer brings the page controls back to live (no longer stale).
    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText('Page 3') as HTMLButtonElement).disabled).toBe(false)
    );
  });

  it('freezes navigation while a results-invalidating gesture is in flight', async () => {
    // The first click leaves `selectPage` outstanding, which marks `results` stale: the pagination
    // then describes a page count the producer has not caught up with, so every page button and
    // both nav arrows are disabled until the answer lands. (This is why there is no mid-flight
    // pagination burst: a second click cannot be issued against a stale page count.)
    const held = heldOpen();
    mountControl('Pagination', state, held.gate);

    await waitFor(() => expect(screen.getByLabelText('Page 2')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Page 2'));

    await waitFor(() =>
      expect((screen.getByLabelText('Page 3') as HTMLButtonElement).disabled).toBe(true)
    );
    expect((screen.getByLabelText('Previous page') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('Next page') as HTMLButtonElement).disabled).toBe(true);

    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText('Page 3') as HTMLButtonElement).disabled).toBe(false)
    );
  });

  it('clamps a held page that a shrinking producer totalPages would put out of range', async () => {
    const held = heldOpen();
    const {lastAction, pushDataModel} = mountControl('Pagination', state, held.gate);

    // Hold page 5 (index 4) optimistically on a 5-page producer.
    await waitFor(() => expect(screen.getByLabelText('Page 5')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Page 5'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 4}})
    );

    // A concurrent gesture (e.g. a larger page size) shrinks the producer to 2 pages while page 4
    // is still held. The held page is clamped into [0, totalPages): the last real page is current,
    // no phantom button sits outside the range.
    pushDataModel([{path: '/state/root/totalPages', value: 2}]);

    await waitFor(() => expect(screen.queryByLabelText('Page 5')).toBeNull());
    expect(screen.getByLabelText('Page 2').getAttribute('aria-current')).toBe('page');
    held.answer();
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

    // After the producer answers, the held value is released and the producer value is read again.
    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText(/Products per page/) as HTMLSelectElement).value).toBe('12')
    );
  });

  it('keeps the backend size selectable while another size is in flight', async () => {
    // Backend is on a non-default size 96; options are [12, 24, 48, 96].
    const held = heldOpen();
    mountControl<PageSizeProps>('PageSize', {pageSize: 96}, held.gate);

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    const select = screen.getByLabelText(/Products per page/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '12'}});

    // While 12 is held, 96 (the size still actually applied by the producer) must remain an option
    // so the user can return to it; the option set is producer ∪ held, not held alone.
    await waitFor(() => expect(select.value).toBe('12'));
    const optionValues = Array.from(select.options).map((option) => option.value);
    expect(optionValues).toContain('96');
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

    // After the producer answers, the held value is released and the producer value is read again.
    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText(/Sort by/) as HTMLSelectElement).value).toBe('0')
    );
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
