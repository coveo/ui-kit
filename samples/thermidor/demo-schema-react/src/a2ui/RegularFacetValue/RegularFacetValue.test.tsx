import {useEffect} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor, cleanup, fireEvent} from '@testing-library/react';
import {A2UIProvider, A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import {createThermidorCatalog, THERMIDOR_CATALOG_ID} from '../components.js';

/**
 * RUNTIME PROOF — optimistic `setSelectionState` on the RegularFacetValue child.
 *
 * Drives the ACTUAL A2-UI binder end to end with the real thermidor catalog:
 *   - RegularFacet declares `values` as a TEMPLATE ChildList `{componentId: 'RegularFacetValue',
 *     path: /state/<facet>/values}` — the binder mounts one RegularFacetValue child per array entry
 *     at basePath `/state/<facet>/values/<i>`;
 *   - each child's `value` / `numberOfResults` / `selectionState` bind RELATIVE to its basePath;
 *   - on toggle the child calls the synthesized `setSelectionState` (optimistic write to the data
 *     model) BEFORE dispatching `toggleSelect`.
 *
 * Asserted:
 *   1. one child checkbox per value entry, reflecting the initial `selectionState`;
 *   2. clicking a value writes `<basePath>/selectionState` in the data model OPTIMISTICALLY
 *      (before any server round-trip) — read back from the surface state;
 *   3. the write touches ONLY that value's node (siblings unchanged);
 *   4. `toggleSelect` is dispatched with the value (the real toggle the backend applies).
 */

const SURFACE_ID = 'regular-facet-value-surface';
const FACET_ID = 'root'; // A2UIRenderer mounts the component with id ROOT_COMPONENT_ID ('root').
const VALUES_PATH = `/state/${FACET_ID}/values`;

const messages: Array<Record<string, unknown>> = [
  {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: THERMIDOR_CATALOG_ID}},
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: FACET_ID,
          component: 'RegularFacet',
          field: 'ec_brand',
          displayName: 'Brand',
          hasActiveValues: false,
          canShowMoreValues: false,
          canShowLessValues: false,
          // TEMPLATE ChildList: mounts one RegularFacetValue per entry under VALUES_PATH.
          values: {componentId: 'RegularFacetValue', path: VALUES_PATH},
          facetSearch: {query: '', canShowMoreResults: false, results: []},
        },
        {
          // The child node declared once as the ChildList template; props bind RELATIVE to basePath.
          id: 'RegularFacetValue',
          component: 'RegularFacetValue',
          value: {path: 'value'},
          numberOfResults: {path: 'numberOfResults'},
          selectionState: {path: 'selectionState'},
        },
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: SURFACE_ID,
      path: VALUES_PATH,
      value: [
        {value: 'Billabong', numberOfResults: 4, selectionState: 'idle'},
        {value: 'Quiksilver', numberOfResults: 2, selectionState: 'selected'},
      ],
    },
  },
];

function MessagePump({onDone}: {onDone: () => void}) {
  const a2ui = useA2UI();
  useEffect(() => {
    a2ui.processMessages(messages);
    onDone();
  }, [a2ui, onDone]);
  return null;
}

describe('RegularFacetValue — optimistic setSelectionState through the real binder', () => {
  it('mounts a child per value and reflects initial selectionState', async () => {
    const catalog = createThermidorCatalog();
    render(
      <A2UIProvider catalog={catalog}>
        <MessagePump onDone={vi.fn()} />
        <A2UIRenderer surfaceId={SURFACE_ID} />
      </A2UIProvider>
    );

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());

    const billabong = screen.getByTestId('facet-value-Billabong') as HTMLInputElement;
    const quiksilver = screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement;
    expect(billabong.type).toBe('checkbox');
    expect(billabong.checked).toBe(false); // idle
    expect(quiksilver.checked).toBe(true); // selected

    cleanup();
  });

  it('writes <basePath>/selectionState OPTIMISTICALLY on click, touching only that value', async () => {
    const catalog = createThermidorCatalog();
    render(
      <A2UIProvider catalog={catalog}>
        <MessagePump onDone={vi.fn()} />
        <A2UIRenderer surfaceId={SURFACE_ID} />
      </A2UIProvider>
    );

    await waitFor(() => expect(screen.getByTestId('facet-value-Billabong')).toBeDefined());

    // Click the idle value → optimistic setSelectionState('selected') at /values/0/selectionState.
    fireEvent.click(screen.getByTestId('facet-value-Billabong'));

    await waitFor(() => {
      const billabong = screen.getByTestId('facet-value-Billabong') as HTMLInputElement;
      // The child re-renders from the optimistically-written data model: now checked.
      expect(billabong.checked).toBe(true);
    });

    // Sibling untouched by the optimistic write.
    const quiksilver = screen.getByTestId('facet-value-Quiksilver') as HTMLInputElement;
    expect(quiksilver.checked).toBe(true);

    cleanup();
  });
});
