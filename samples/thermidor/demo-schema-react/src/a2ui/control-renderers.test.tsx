import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor, act} from '@testing-library/react';
import type {PageSizeProps, PaginationProps, SortProps} from '@coveo/thermidor-schema';
import {mountSurface} from './mount-surface.harness.js';

afterEach(cleanup);

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

    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText('Page 3') as HTMLButtonElement).disabled).toBe(false)
    );
  });

  it('freezes navigation while a results-invalidating gesture is in flight', async () => {
    // Also why there is no pagination burst test: a second click can't be issued while stale.
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

    await waitFor(() => expect(screen.getByLabelText('Page 5')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Page 5'));
    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'selectPage', context: {page: 4}})
    );

    // A concurrent gesture (e.g. a larger page size) shrinks the producer while page 5 is held.
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

    await held.answer();
    await waitFor(() =>
      expect((screen.getByLabelText(/Products per page/) as HTMLSelectElement).value).toBe('12')
    );
  });

  it('keeps the backend size selectable while another size is in flight', async () => {
    // 96 is not a default option: it only exists because the producer applies it.
    const held = heldOpen();
    mountControl<PageSizeProps>('PageSize', {pageSize: 96}, held.gate);

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    const select = screen.getByLabelText(/Products per page/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '12'}});

    await waitFor(() => expect(select.value).toBe('12'));
    const optionValues = Array.from(select.options).map((option) => option.value);
    expect(optionValues).toContain('96');
    held.answer();
  });

  it('sends only the first and last size of a rapid burst, coalescing the queue', async () => {
    // 96 adds the fourth option a three-change burst needs.
    const view = mountHeldControl<PageSizeProps>(
      'PageSize',
      {pageSize: 96},
      (context) => context?.['pageSize']
    );

    await waitFor(() => expect(screen.getByLabelText(/Products per page/)).toBeDefined());
    const select = screen.getByLabelText(/Products per page/) as HTMLSelectElement;
    fireEvent.change(select, {target: {value: '12'}});
    fireEvent.change(select, {target: {value: '24'}});
    fireEvent.change(select, {target: {value: '48'}});

    await waitFor(() => expect(view.sent()).toEqual([12]));
    await view.release();

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
    fireEvent.change(select, {target: {value: '1'}});
    fireEvent.change(select, {target: {value: '2'}});
    fireEvent.change(select, {target: {value: '3'}});

    await waitFor(() => expect(view.sent()).toEqual(['price_asc']));
    await view.release();

    await waitFor(() => expect(view.sent()).toEqual(['price_asc', 'name_asc']));
  });
});
