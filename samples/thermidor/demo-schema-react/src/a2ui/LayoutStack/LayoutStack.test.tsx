import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, it, expect, afterEach} from 'vitest';
import {screen, cleanup, waitFor} from '@testing-library/react';
import {mountSurface} from '../mount-surface.harness.js';
import {cssRules, declarationsFor} from '../../test/css-rules.js';

/**
 * LayoutStack is a `createComponentImplementation` container driven by the generic binder. It mounts its
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
    .filter((text): text is string => text !== null && text.startsWith('child_'));
}

describe('LayoutStack', () => {
  it('renders a stable empty container with no children', async () => {
    mountLayout([]);

    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
    expect(screen.getByTestId('layout-stack').querySelectorAll('p').length).toBe(0);
  });

  it('mounts each declared child exactly once, in declared order', async () => {
    const childIds = ['child_query_summary_2', 'child_product_list_2', 'child_pagination_2'];
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
    const childIds = ['child_facet_manager_2'];
    const {container} = mountLayout(childIds);
    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
    await waitFor(() => expect(mountedChildIds(container)).toEqual(childIds));
  });

  describe('row slot rules, through the renderer host of each child', () => {
    const RULES = cssRules(
      readFileSync(join(import.meta.dirname, 'LayoutStack.module.css'), 'utf8'),
      {
        row: "[data-direction='row']",
        column: "[data-direction='column']",
      }
    );
    const BRAND = {
      facetId: 'regular-facet-2',
      field: 'ec_brand',
      displayName: 'Brand',
      type: 'regular',
      values: [{value: 'Billabong', state: 'selected'}],
    };

    async function mountRow(children: Array<Record<string, unknown>>, dataModel = DATA_MODEL) {
      const {container} = mountSurface({
        component: {
          component: 'LayoutStack',
          direction: 'row',
          children: children.map(({id}) => id as string),
        },
        children,
        dataModel,
      });
      await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());
      await waitFor(() => expect(container.querySelector('[data-layout="fill"]')).not.toBeNull());
      const row = screen.getByTestId('layout-stack');
      return {row, slot: (index: number) => row.children[index]!};
    }

    const DATA_MODEL = [
      {path: '/state/full/facets', value: [BRAND]},
      {path: '/state/empty/facets', value: []},
    ];
    const SUMMARY = summaryChild('child_summary');
    const PAGINATION = {
      id: 'pages',
      component: 'Pagination',
      page: 0,
      pageSize: 12,
      totalEntries: 6,
      totalPages: 1,
    };

    it('hides the slot of a child that renders nothing, inside or outside surface controls', async () => {
      const {slot} = await mountRow([
        SUMMARY,
        PAGINATION,
        {id: 'empty', component: 'Breadbox', facets: {'@path': '/state/empty/facets'}},
      ]);

      expect(slot(1).textContent).toBe('');
      expect(declarationsFor(slot(1), RULES).display).toBe('none');
      expect(declarationsFor(slot(2), RULES).display).toBe('none');
      expect(declarationsFor(slot(0), RULES).display).toBeUndefined();
    });

    it('gives a full-row child the whole row', async () => {
      const {slot} = await mountRow([
        SUMMARY,
        {id: 'full', component: 'Breadbox', facets: {'@path': '/state/full/facets'}},
      ]);
      await waitFor(() => expect(slot(1).querySelector('[data-layout="full-row"]')).not.toBeNull());

      expect(declarationsFor(slot(1), RULES)['flex-basis']).toBe('100%');
      expect(declarationsFor(slot(0), RULES)['flex-basis']).toBeUndefined();
    });

    it('lets a fill child take the free space and aligns the row to the top', async () => {
      const {row, slot} = await mountRow([SUMMARY, PAGINATION]);

      expect(declarationsFor(slot(0), RULES).flex).toBe('1 1 0');
      expect(declarationsFor(row, RULES)['align-items']).toBe('flex-start');
    });
  });
});
