import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {A2UIProvider, ROOT_COMPONENT_ID} from '@copilotkit/a2ui-renderer';
import type {A2uiV09Message} from '@coveo/thermidor';
import {createThermidorCatalog, THERMIDOR_CATALOG_ID} from './components.js';
import {ThermidorA2UIStream, TurnSurfaces} from './surfaces.js';

afterEach(() => cleanup());

const CATALOG = createThermidorCatalog();
const SURFACE_ID = 'turn-surface';
const NOTE = 'Earlier results. Ask a follow-up or search again to refine.';

const MESSAGES = [
  {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: THERMIDOR_CATALOG_ID}},
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        {id: ROOT_COMPONENT_ID, component: 'PageSize', pageSize: {path: '/state/root/pageSize'}},
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {surfaceId: SURFACE_ID, path: '/state/root/pageSize', value: 24},
  },
] as unknown as A2uiV09Message[];

function Turn({interactive}: {interactive: boolean}) {
  return (
    <A2UIProvider catalog={CATALOG} onAction={() => {}}>
      <ThermidorA2UIStream messages={MESSAGES} />
      <TurnSurfaces surfaceIds={[SURFACE_ID]} interactive={interactive} />
    </A2UIProvider>
  );
}

function renderTurnSurfaces(interactive: boolean) {
  return render(<Turn interactive={interactive} />);
}

function pageSizeSelect() {
  return screen.getByLabelText('Products per page:');
}

// The select is disabled through its `fieldset`, which `disabled` does not reflect.
function isDisabled(control: Element) {
  return control.matches(':disabled');
}

describe('TurnSurfaces', () => {
  it('leaves the controls of an interactive turn enabled, without the earlier-results note', async () => {
    renderTurnSurfaces(true);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(isDisabled(pageSizeSelect())).toBe(false);
    expect(screen.queryByText(NOTE)).toBeNull();
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('disables the controls of an earlier turn and explains why', async () => {
    renderTurnSurfaces(false);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(isDisabled(pageSizeSelect())).toBe(true);
    expect(screen.getByRole('group', {name: NOTE})).toBeDefined();
  });

  it('keeps an earlier turn readable by assistive technology', async () => {
    const {container} = renderTurnSurfaces(false);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(container.querySelector('[inert]')).toBeNull();
    expect(screen.getByRole('region', {name: `A2-UI surface ${SURFACE_ID}`})).toBeDefined();
  });

  it('disables the controls once a newer turn takes over', async () => {
    const {rerender} = renderTurnSurfaces(true);
    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(false));

    rerender(<Turn interactive={false} />);

    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(true));
  });
});
