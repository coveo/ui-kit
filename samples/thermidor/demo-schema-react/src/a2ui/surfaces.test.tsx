import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {A2UIProvider, ROOT_COMPONENT_ID} from '@copilotkit/a2ui-renderer';
import type {A2uiV09Message} from '@coveo/thermidor';
import {createThermidorCatalog, THERMIDOR_CATALOG_ID} from './components.js';
import {ThermidorA2UIStream, TurnSurfaces} from './surfaces.js';
import {SessionRequestProvider} from './session-request.js';
import {requestSnapshot} from '../test/fake-session-requests.js';

const originalScrollIntoView = Element.prototype.scrollIntoView;

afterEach(() => {
  cleanup();
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

const CATALOG = createThermidorCatalog();
const SURFACE_ID = 'turn-surface';
const NOTE = 'Earlier results. Ask a follow-up or search again to refine.';

/** A surface holding a page size select. */
function surfaceMessages(surfaceId: string) {
  return [
    {version: 'v0.9', createSurface: {surfaceId, catalogId: THERMIDOR_CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: [
          {id: ROOT_COMPONENT_ID, component: 'PageSize', pageSize: {path: '/state/root/pageSize'}},
        ],
      },
    },
    {
      version: 'v0.9',
      updateDataModel: {surfaceId, path: '/state/root/pageSize', value: 24},
    },
  ] as unknown as A2uiV09Message[];
}

const MESSAGES = surfaceMessages(SURFACE_ID);

/** A session whose request in flight locks the surface, or that is idle. */
const LOCKED = requestSnapshot({kind: 'prompt', turnId: 'turn'});
const UNLOCKED = requestSnapshot(undefined);

function lockedSource(locked: boolean) {
  return {
    getSnapshot: () => (locked ? LOCKED : UNLOCKED),
    subscribe: () => () => {},
    sendAndWait: () => Promise.resolve(),
  };
}

function Turn({
  interactive,
  locked = false,
  isStreaming = false,
}: {
  interactive: boolean;
  locked?: boolean;
  isStreaming?: boolean;
}) {
  return (
    <SessionRequestProvider value={lockedSource(locked)}>
      <A2UIProvider catalog={CATALOG} onAction={() => {}}>
        <ThermidorA2UIStream messages={MESSAGES} loadingSurfaces={new Map()} />
        <TurnSurfaces
          surfaceIds={[SURFACE_ID]}
          interactive={interactive}
          isStreaming={isStreaming}
        />
      </A2UIProvider>
    </SessionRequestProvider>
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

describe('TurnSurfaces while a request is in flight', () => {
  it('disables the active turn and marks it busy', async () => {
    const {rerender} = renderTurnSurfaces(true);
    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(false));

    rerender(<Turn interactive locked />);

    expect(isDisabled(pageSizeSelect())).toBe(true);
    expect(pageSizeSelect().closest('fieldset')?.getAttribute('aria-busy')).toBe('true');
    expect(screen.queryByText(NOTE)).toBeNull();
  });

  it('leaves an earlier turn read-only without marking it busy', async () => {
    render(<Turn interactive={false} locked />);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(pageSizeSelect().closest('fieldset')?.hasAttribute('aria-busy')).toBe(false);
  });

  it('dims the surface it disables', async () => {
    render(<Turn interactive locked />);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(pageSizeSelect().closest('fieldset')?.className).toMatch(/locked/);
  });

  it('disables the exchange that streams without dimming it', async () => {
    render(<Turn interactive locked isStreaming />);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(isDisabled(pageSizeSelect())).toBe(true);
    expect(pageSizeSelect().closest('fieldset')?.className).not.toMatch(/locked/);
  });

  it('enables the controls again once the request ends', async () => {
    const {rerender} = render(<Turn interactive locked />);
    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(true));

    rerender(<Turn interactive />);

    expect(isDisabled(pageSizeSelect())).toBe(false);
    expect(pageSizeSelect().closest('fieldset')?.hasAttribute('aria-busy')).toBe(false);
  });

  it('gives focus back to the control the shopper used, without scrolling to it', async () => {
    const {rerender} = renderTurnSurfaces(true);
    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(false));
    const select = pageSizeSelect() as HTMLSelectElement;
    select.focus();
    // A browser drops the focus of a control its fieldset disables; jsdom keeps it.
    select.blur();

    rerender(<Turn interactive locked />);
    expect(document.activeElement).toBe(document.body);
    const focus = vi.spyOn(select, 'focus');

    rerender(<Turn interactive />);

    expect(document.activeElement).toBe(select);
    expect(focus).toHaveBeenCalledWith({preventScroll: true});
  });

  it('gives focus back to a control pressed without receiving focus', async () => {
    const {rerender} = renderTurnSurfaces(true);
    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(false));
    const select = pageSizeSelect();
    fireEvent.pointerDown(select);
    expect(document.activeElement).toBe(document.body);

    rerender(<Turn interactive locked />);
    rerender(<Turn interactive />);

    expect(document.activeElement).toBe(select);
  });

  it('leaves the focus where the shopper moved it during the request', async () => {
    const {rerender} = renderTurnSurfaces(true);
    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(false));
    const select = pageSizeSelect() as HTMLSelectElement;
    select.focus();
    select.blur();
    const elsewhere = document.createElement('input');
    document.body.append(elsewhere);

    rerender(<Turn interactive locked />);
    elsewhere.focus();
    rerender(<Turn interactive />);

    expect(document.activeElement).toBe(elsewhere);
    elsewhere.remove();
  });

  it('gives focus back to the control used last when two exchanges are interactive', async () => {
    const FOLLOW_UP_ID = 'follow-up-surface';
    const messages = [...MESSAGES, ...surfaceMessages(FOLLOW_UP_ID)];
    function Exchanges({locked}: {locked: boolean}) {
      return (
        <SessionRequestProvider value={lockedSource(locked)}>
          <A2UIProvider catalog={CATALOG} onAction={() => {}}>
            <ThermidorA2UIStream messages={messages} loadingSurfaces={new Map()} />
            <TurnSurfaces surfaceIds={[SURFACE_ID]} interactive isStreaming={false} />
            <TurnSurfaces surfaceIds={[FOLLOW_UP_ID]} interactive isStreaming={false} />
          </A2UIProvider>
        </SessionRequestProvider>
      );
    }
    const {rerender} = render(<Exchanges locked={false} />);
    await waitFor(() => expect(screen.getAllByLabelText('Products per page:')).toHaveLength(2));
    const [first, second] = screen.getAllByLabelText('Products per page:') as HTMLSelectElement[];

    first.focus();
    first.blur();
    rerender(<Exchanges locked />);
    rerender(<Exchanges locked={false} />);
    second.focus();
    second.blur();
    rerender(<Exchanges locked />);
    rerender(<Exchanges locked={false} />);

    expect(document.activeElement).toBe(second);
  });
});

describe('TurnSurfaces loading placeholders', () => {
  function renderPlaceholder(isStreaming: boolean) {
    return render(
      <A2UIProvider catalog={CATALOG} onAction={() => {}}>
        <ThermidorA2UIStream
          messages={MESSAGES}
          loadingSurfaces={new Map([[SURFACE_ID, 'ProductCarousel']])}
        >
          <TurnSurfaces surfaceIds={[SURFACE_ID]} interactive isStreaming={isStreaming} />
        </ThermidorA2UIStream>
      </A2UIProvider>
    );
  }

  it('draws the skeleton of a loading surface in its place while its exchange streams', () => {
    renderPlaceholder(true);

    const section = screen.getByRole('region', {name: `A2-UI surface ${SURFACE_ID}`});
    expect(section.querySelector('[aria-label="Loading product carousel"]')).not.toBeNull();
    expect(screen.queryByLabelText('Products per page:')).toBeNull();
  });

  it('draws nothing for a placeholder left behind once its exchange ended', () => {
    const {container} = renderPlaceholder(false);

    expect(screen.queryByRole('region', {name: `A2-UI surface ${SURFACE_ID}`})).toBeNull();
    expect(container.querySelector('fieldset')).toBeNull();
  });

  it('does not scroll to the content that replaces a drawn placeholder', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const loadingSurfaces = new Map([['placeholder', 'ProductCarousel']]);
    const page = (surfaceIds: string[]) => (
      <A2UIProvider catalog={CATALOG} onAction={() => {}}>
        <ThermidorA2UIStream messages={MESSAGES} loadingSurfaces={loadingSurfaces}>
          <TurnSurfaces surfaceIds={surfaceIds} interactive isStreaming />
        </ThermidorA2UIStream>
      </A2UIProvider>
    );
    const {rerender} = render(page(['placeholder']));

    rerender(page([SURFACE_ID]));

    expect(screen.getByRole('region', {name: `A2-UI surface ${SURFACE_ID}`})).toBeDefined();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls to a surface added after the drawn ones', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const page = (surfaceIds: string[]) => (
      <A2UIProvider catalog={CATALOG} onAction={() => {}}>
        <ThermidorA2UIStream messages={MESSAGES} loadingSurfaces={new Map()}>
          <TurnSurfaces surfaceIds={surfaceIds} interactive isStreaming />
        </ThermidorA2UIStream>
      </A2UIProvider>
    );
    const {rerender} = render(page([SURFACE_ID]));

    rerender(page([SURFACE_ID, 'added']));

    expect(scrollIntoView).toHaveBeenCalledOnce();
  });
});

describe('ThermidorA2UIStream', () => {
  it('feeds only the new messages of a stream that grows, keeping the surfaces drawn', async () => {
    const SECOND_ID = 'second-surface';
    const page = (messages: A2uiV09Message[]) => (
      <SessionRequestProvider value={lockedSource(false)}>
        <A2UIProvider catalog={CATALOG} onAction={() => {}}>
          <ThermidorA2UIStream messages={messages} loadingSurfaces={new Map()}>
            <TurnSurfaces surfaceIds={[SURFACE_ID, SECOND_ID]} interactive isStreaming={false} />
          </ThermidorA2UIStream>
        </A2UIProvider>
      </SessionRequestProvider>
    );
    const {rerender} = render(page(MESSAGES));
    const first = await screen.findByLabelText('Products per page:');

    rerender(page([...MESSAGES, ...surfaceMessages(SECOND_ID)]));

    await waitFor(() => expect(screen.getAllByLabelText('Products per page:')).toHaveLength(2));
    expect(screen.getAllByLabelText('Products per page:')[0]).toBe(first);
  });
});

describe('the failure of an action', () => {
  function renderWithActionError(surfaceId: string) {
    const snapshot = {
      ...UNLOCKED,
      actionError: {
        message: 'Bad gateway',
        name: 'setPageSize',
        surfaceId,
        sourceComponentId: ROOT_COMPONENT_ID,
      },
    };
    return render(
      <SessionRequestProvider
        value={{
          ...lockedSource(false),
          getSnapshot: () => snapshot,
        }}
      >
        <A2UIProvider catalog={CATALOG} onAction={() => {}}>
          <ThermidorA2UIStream messages={MESSAGES} loadingSurfaces={new Map()} />
          <TurnSurfaces surfaceIds={[SURFACE_ID]} interactive isStreaming={false} />
        </A2UIProvider>
      </SessionRequestProvider>
    );
  }

  it('shows under the block the action came from', () => {
    renderWithActionError(SURFACE_ID);

    expect(screen.getByRole('alert').textContent).toContain('Bad gateway');
  });

  it('does not show under another block', () => {
    renderWithActionError('another-surface');

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
