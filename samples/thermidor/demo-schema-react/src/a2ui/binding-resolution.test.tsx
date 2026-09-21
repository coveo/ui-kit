import {useEffect} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor, cleanup} from '@testing-library/react';
import {A2UIProvider, A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import {createThermidorCatalog, THERMIDOR_CATALOG_ID} from './components.js';

/**
 * REGRESSION — runtime binding resolution through the FROZEN renderer/binder.
 *
 * This exercises the ACTUAL A2-UI binder that resolves `{ "path": ... }` bindings against a
 * surface data model, using the REAL thermidor catalog produced by `createThermidorCatalog()`.
 * Unlike the other unit tests (which mount a renderer with already-resolved props), this drives
 * the whole pipeline: `createSurface` + `updateComponents` (carrying `{ path }` bindings) +
 * `updateDataModel` (writing `/state/<id>/...`) → the binder classifies each catalog prop field
 * and resolves the binding before the renderer runs.
 *
 * WITHOUT the `toBinderProps` shim the generated Zod 4 `XxxPropsSchema` classify every field as
 * STATIC, the raw `{ path }` object leaks to the renderer, and `NextActionsBar` throws
 * `actions.map is not a function`. WITH the shim, the array/scalar bindings resolve.
 *
 * Covered:
 *  - array `{ path }` binding: NextActionsBar `actions` resolves to an action array (the crash);
 *  - scalar `{ path }` bindings: QuerySummary `query` / `totalEntries` resolve to string/number;
 *  - a container: LayoutStack (root) mounts its static child-ref list, driving the two above.
 */

const SURFACE_ID = 'binding-resolution-surface';

const ROOT_ID = 'root';
const ACTIONS_ID = 'next-actions';
const SUMMARY_ID = 'query-summary';

const messages: Array<Record<string, unknown>> = [
  {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: THERMIDOR_CATALOG_ID}},
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        // Container root: static child-ref list (must pass through untouched).
        {
          id: ROOT_ID,
          component: 'LayoutStack',
          direction: 'column',
          children: [ACTIONS_ID, SUMMARY_ID],
        },
        // Array `{ path }` binding — the crashing case.
        {
          id: ACTIONS_ID,
          component: 'NextActionsBar',
          actions: {path: `/state/${ACTIONS_ID}/actions`},
        },
        // Scalar `{ path }` bindings.
        {
          id: SUMMARY_ID,
          component: 'QuerySummary',
          query: {path: `/state/${SUMMARY_ID}/query`},
          firstIndex: {path: `/state/${SUMMARY_ID}/firstIndex`},
          lastIndex: {path: `/state/${SUMMARY_ID}/lastIndex`},
          totalEntries: {path: `/state/${SUMMARY_ID}/totalEntries`},
        },
      ],
    },
  },
  // Write the state the bindings dereference.
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: SURFACE_ID,
      path: `/state/${ACTIONS_ID}/actions`,
      value: [
        {text: 'Add fins', type: 'followup'},
        {text: 'Compare boards', type: 'search'},
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: SURFACE_ID,
      path: `/state/${SUMMARY_ID}/query`,
      value: 'surfboards',
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {surfaceId: SURFACE_ID, path: `/state/${SUMMARY_ID}/firstIndex`, value: 1},
  },
  {
    version: 'v0.9',
    updateDataModel: {surfaceId: SURFACE_ID, path: `/state/${SUMMARY_ID}/lastIndex`, value: 12},
  },
  {
    version: 'v0.9',
    updateDataModel: {surfaceId: SURFACE_ID, path: `/state/${SUMMARY_ID}/totalEntries`, value: 43},
  },
];

function MessagePump({onDone}: {onDone: () => void}) {
  const {processMessages} = useA2UI();
  useEffect(() => {
    processMessages(messages);
    onDone();
  }, [processMessages, onDone]);
  return null;
}

describe('Regression — frozen binder resolves { path } bindings through the real thermidor catalog', () => {
  it('resolves NextActionsBar `actions` (array binding), QuerySummary scalars, and a container child-ref list — no `actions.map is not a function`', async () => {
    const catalog = createThermidorCatalog();
    const onDone = vi.fn();

    render(
      <A2UIProvider catalog={catalog}>
        <MessagePump onDone={onDone} />
        <A2UIRenderer surfaceId={SURFACE_ID} />
      </A2UIProvider>
    );

    // Container mounted its children.
    await waitFor(() => expect(screen.getByTestId('layout-stack')).toBeDefined());

    // Array binding resolved to the action array → buttons render (the crash is avoided).
    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'Add fins'})).toBeDefined();
    });
    expect(screen.getByRole('button', {name: 'Compare boards'})).toBeDefined();

    // Scalar bindings resolved on the sibling component.
    const summary = screen.getByText(/Products/);
    expect(summary.textContent).toContain('surfboards');
    expect(summary.textContent).toContain('43');

    cleanup();
  });
});
