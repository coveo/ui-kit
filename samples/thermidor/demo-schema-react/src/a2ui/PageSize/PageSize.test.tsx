import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * PageSize is a `createReactComponent` implementation driven by the generic binder, mounted
 * end-to-end through the real thermidor catalog: `pageSize` is a `{path}` binding resolved from the
 * surface data model, and the change handler dispatches `setPageSize`, captured (unwrapped) on
 * `lastAction()` as `{name, context}`.
 */

afterEach(() => cleanup());

function mountPageSize(pageSize: number, readOnly?: boolean) {
  return mountSurface({
    component: {component: 'PageSize', pageSize: {path: '/state/root/pageSize'}},
    readOnly,
    dataModel: [{path: '/state/root/pageSize', value: pageSize}],
  });
}

describe('PageSize', () => {
  it('renders the default page size options', async () => {
    mountPageSize(24);

    await waitFor(() => expect(screen.getByText('Products per page:')).toBeDefined());
    expect(screen.getByRole('option', {name: '12'})).toBeDefined();
    expect(screen.getByRole('option', {name: '24'})).toBeDefined();
    expect(screen.getByRole('option', {name: '48'})).toBeDefined();
  });

  it('shows the current pageSize as selected', async () => {
    mountPageSize(48);

    await waitFor(() => expect(screen.getByLabelText('Products per page:')).toBeDefined());
    expect((screen.getByLabelText('Products per page:') as HTMLSelectElement).value).toBe('48');
  });

  it('includes the current pageSize in the options when not a default', async () => {
    mountPageSize(36);

    await waitFor(() => expect(screen.getByLabelText('Products per page:')).toBeDefined());
    const options = screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value);
    expect(options).toEqual(['12', '24', '36', '48']);
  });

  it('dispatches a setPageSize A2-UI action with the new size on change', async () => {
    const {lastAction} = mountPageSize(24);

    await waitFor(() => expect(screen.getByLabelText('Products per page:')).toBeDefined());
    fireEvent.change(screen.getByLabelText('Products per page:'), {target: {value: '48'}});

    await waitFor(() =>
      expect(lastAction()).toMatchObject({name: 'setPageSize', context: {pageSize: 48}})
    );
  });

  it('disables the select in a read-only surface', async () => {
    mountPageSize(24, true);

    await waitFor(() => expect(screen.getByLabelText('Products per page:')).toBeDefined());
    expect((screen.getByLabelText('Products per page:') as HTMLSelectElement).disabled).toBe(true);
  });
});
