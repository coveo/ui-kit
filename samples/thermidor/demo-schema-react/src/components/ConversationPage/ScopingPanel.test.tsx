import type {ReactNode} from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {A2UIProvider, ROOT_COMPONENT_ID} from '@copilotkit/a2ui-renderer';
import type {A2uiV09Message} from '@coveo/thermidor';
import {createThermidorCatalog, THERMIDOR_CATALOG_ID} from '../../a2ui/components.js';
import {SurfaceGroup, ThermidorA2UIStream} from '../../a2ui/surfaces.js';
import {ScopingPanel} from './ScopingPanel.js';

afterEach(cleanup);

const SURFACE_ID = 'turn-1/scoping-1';

const FACET_STATE = {
  field: 'source',
  displayName: 'Source',
  hasActiveValues: false,
  canShowMoreValues: true,
  canShowLessValues: false,
  values: [{value: 'Docs', numberOfResults: 4, state: 'idle'}],
  facetSearch: {query: '', canShowMoreResults: false, results: []},
};

/** A Scoping block whose root is one Facet with values. */
const MESSAGES = [
  {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: THERMIDOR_CATALOG_ID}},
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: ROOT_COMPONENT_ID,
          component: 'RegularFacet',
          ...Object.fromEntries(
            Object.keys(FACET_STATE).map((key) => [key, {path: `/state/root/${key}`}])
          ),
        },
      ],
    },
  },
  ...Object.entries(FACET_STATE).map(([key, value]) => ({
    version: 'v0.9',
    updateDataModel: {surfaceId: SURFACE_ID, path: `/state/root/${key}`, value},
  })),
] as unknown as A2uiV09Message[];

function renderInStream(children: ReactNode) {
  return render(
    <A2UIProvider catalog={createThermidorCatalog()} onAction={() => {}}>
      <ThermidorA2UIStream messages={MESSAGES} loadingSurfaces={new Map()}>
        {children}
      </ThermidorA2UIStream>
    </A2UIProvider>
  );
}

describe('ScopingPanel', () => {
  it('draws its Facets without a search field', async () => {
    renderInStream(
      <ScopingPanel
        scoping={{surfaceId: SURFACE_ID, turnId: 'turn-1'}}
        interactive
        isStreaming={false}
      />
    );

    await waitFor(() => expect(screen.getByTestId('facet-value-Docs')).toBeDefined());
    expect(screen.queryByRole('textbox', {name: 'Search Source'})).toBeNull();
  });

  it('offers facet search on the same Facet outside the panel', async () => {
    renderInStream(
      <SurfaceGroup surfaceIds={[SURFACE_ID]} interactive isStreaming={false} readOnlyNote="" />
    );

    await waitFor(() => expect(screen.getByTestId('facet-value-Docs')).toBeDefined());
    expect(screen.getByRole('textbox', {name: 'Search Source'})).toBeDefined();
  });
});
