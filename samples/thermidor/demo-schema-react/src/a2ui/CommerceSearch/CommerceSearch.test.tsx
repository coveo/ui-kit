import {describe, it, expect, afterEach} from 'vitest';
import {screen, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';

/**
 * CommerceSearch is a `createReactComponent` container driven by the generic binder. It mounts its
 * named `sidebarChild` / `mainChild` slots by id via `buildChild`. Mounted root end-to-end, it
 * asserts the observable effect: the referenced child nodes render inside the container, and an
 * absent/dangling slot mounts nothing. Children are LayoutStack leaves keyed by a distinguishing
 * `data-testid` (`layout-stack`), disambiguated by their own child content.
 */

afterEach(() => cleanup());

// A tiny distinguishable child: a QuerySummary node that renders identifiable text.
function summaryChild(id: string, query: string): Record<string, unknown> {
  return {
    id,
    component: 'QuerySummary',
    query,
    firstIndex: 1,
    lastIndex: 12,
    totalEntries: 43,
  };
}

describe('CommerceSearch', () => {
  it('renders a stable empty two-column layout with no slots', async () => {
    mountSurface({component: {component: 'CommerceSearch'}});

    await waitFor(() => expect(screen.getByTestId('commerce-search')).toBeDefined());
    // No slot children declared → nothing mounted inside.
    expect(screen.queryByText(/for/)).toBeNull();
  });

  it('mounts the sidebarChild into the sidebar and the mainChild into the main area', async () => {
    mountSurface({
      component: {
        component: 'CommerceSearch',
        sidebarChild: 'search-sidebar',
        mainChild: 'search-main',
      },
      children: [
        summaryChild('search-sidebar', 'SidebarQuery'),
        summaryChild('search-main', 'MainQuery'),
      ],
    });

    await waitFor(() => expect(screen.getByTestId('commerce-search')).toBeDefined());
    await waitFor(() => expect(screen.getByText('SidebarQuery')).toBeDefined());
    expect(screen.getByText('MainQuery')).toBeDefined();
  });

  it('mounts only the sidebar slot when only sidebarChild is set', async () => {
    mountSurface({
      component: {component: 'CommerceSearch', sidebarChild: 'search-sidebar'},
      children: [summaryChild('search-sidebar', 'SidebarQuery')],
    });

    await waitFor(() => expect(screen.getByText('SidebarQuery')).toBeDefined());
    expect(screen.queryByText('MainQuery')).toBeNull();
  });

  it('mounts only the main slot when only mainChild is set', async () => {
    mountSurface({
      component: {component: 'CommerceSearch', mainChild: 'search-main'},
      children: [summaryChild('search-main', 'MainQuery')],
    });

    await waitFor(() => expect(screen.getByText('MainQuery')).toBeDefined());
    expect(screen.queryByText('SidebarQuery')).toBeNull();
  });

  it('mounts nothing for a slot referencing an id with no corresponding component', async () => {
    mountSurface({
      component: {
        component: 'CommerceSearch',
        sidebarChild: 'search-sidebar',
        mainChild: 'missing-main',
      },
      children: [summaryChild('search-sidebar', 'SidebarQuery')],
    });

    await waitFor(() => expect(screen.getByText('SidebarQuery')).toBeDefined());
    // `missing-main` names no component node → nothing mounted for it.
    expect(screen.queryByText('MainQuery')).toBeNull();
  });
});
