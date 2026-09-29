import {describe, it, expect, afterEach} from 'vitest';
import {screen, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * LayoutStack is a `createReactComponent` container driven by the generic binder. It mounts its
 * ordered `children` id list via `buildChild` and reads its `direction` presentation prop. Mounted
 * root end-to-end, it asserts the observable effects: the declared child nodes render in declared
 * order, and `data-direction` reflects the resolved `direction`. Children are QuerySummary leaves
 * whose query text encodes their id, so DOM order is assertable.
 */

afterEach(() => cleanup());

function summaryChild(id: string): Record<string, unknown> {
  return {id, component: 'QuerySummary', query: id, firstIndex: 1, lastIndex: 12, totalEntries: 43};
}

function mountLayout(childIds: string[], direction?: 'column' | 'row') {
  return mountSurface({
    component: {
      component: 'LayoutStack',
      children: childIds,
      ...(direction ? {direction} : {}),
    },
    children: childIds.map((id) => summaryChild(id)),
  });
}

// The <strong>query</strong> text nodes carry the child ids; read them in DOM order.
function mountedChildIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-testid="layout-stack"] p strong'))
    .map((node) => node.textContent)
    .filter((text): text is string => text !== null && text.startsWith('child-'));
}

describe('LayoutStack', () => {
  it('renders a stable empty container with no children', async () => {
    mountLayout([]);

    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
    expect(screen.getByTestId('layout-stack').querySelectorAll('p').length).toBe(0);
  });

  it('mounts each declared child exactly once, in declared order', async () => {
    const childIds = ['child-query-summary-2', 'child-product-list-2', 'child-pagination-2'];
    const {container} = mountLayout(childIds);

    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
    await waitFor(() => expect(mountedChildIds(container)).toEqual(childIds));
  });

  it('defaults to column direction when direction is absent', async () => {
    mountLayout([]);
    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
    expect(screen.getByTestId('layout-stack').getAttribute('data-direction')).toBe('column');
  });

  it('applies row direction when declared', async () => {
    mountLayout([], 'row');
    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
    expect(screen.getByTestId('layout-stack').getAttribute('data-direction')).toBe('row');
  });

  it('mounts solely from the resolved props composition', async () => {
    const childIds = ['child-facet-manager-2'];
    const {container} = mountLayout(childIds);
    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
    await waitFor(() => expect(mountedChildIds(container)).toEqual(childIds));
  });
});
