import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import type {ActionPayload} from '@a2ui/web_core';
import type {A2uiMessage, ActionError} from '@coveo/converse';
import {createThermidorCatalog, THERMIDOR_CATALOG_ID} from './components.js';
import {ThermidorA2UIStream, TurnSurfaces} from './surfaces.js';
import {SessionRequestProvider, type SessionRequestSource} from './session-request.js';
import {makeSurfaces} from '../test/turn-fixtures.js';
import {createFakeSessionRequests, requestSnapshot} from '../test/fake-session-requests.js';
import {createFakeCartStore, type FakeCartStore} from '../test/fake-cart-store.js';
import {CartProvider} from '../cart/CartProvider.js';
import {renderProductCardCartActions} from '../cart/AddToCartControl/product-card-cart-actions.js';
import {ProductCardActionsContext} from './ProductCard/product-card-actions.js';

const originalScrollIntoView = Element.prototype.scrollIntoView;

afterEach(() => {
  cleanup();
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

const CATALOG = createThermidorCatalog();
const ROOT_COMPONENT_ID = 'root';
const ignoreAction = () => {};
const SURFACE_ID = 'turn-surface';
const NOTE = 'Earlier results. Ask a follow-up or search again to refine.';

const WETSUIT = {
  permanentid: 'wetsuit',
  ec_name: 'Wetsuit',
  ec_price: 400,
  clickUri: 'https://example.com/wetsuit',
  additionalFields: {},
};

/** A surface holding a page size select, which acts on the surface. */
function surfaceMessages(surfaceId: string) {
  return [
    {
      version: '1.0',
      createSurface: {
        surfaceId,
        catalogId: THERMIDOR_CATALOG_ID,
        components: [
          {
            id: ROOT_COMPONENT_ID,
            component: 'PageSize',
            pageSize: {'@path': '/state/root/pageSize'},
          },
        ],
      },
    },
    {
      version: '1.0',
      updateDataModel: {surfaceId, path: '/state/root/pageSize', value: 24},
    },
  ] as unknown as A2uiMessage[];
}

/** The same surface with a product carousel beside its page size select. */
const WITH_PRODUCTS = [
  ...surfaceMessages(SURFACE_ID),
  {
    version: '1.0',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        {id: ROOT_COMPONENT_ID, component: 'LayoutStack', children: ['page_size', 'carousel']},
        {id: 'page_size', component: 'PageSize', pageSize: {'@path': '/state/root/pageSize'}},
        {
          id: 'carousel',
          component: 'ProductCarousel',
          heading: 'Wetsuits',
          products: {'@path': '/state/root/products'},
        },
      ],
    },
  },
  {
    version: '1.0',
    updateDataModel: {surfaceId: SURFACE_ID, path: '/state/root/products', value: [WETSUIT]},
  },
] as unknown as A2uiMessage[];

/** The same surface showing a product list of one grouped product. */
const WITH_GROUPED_LIST = [
  ...surfaceMessages(SURFACE_ID),
  {
    version: '1.0',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: ROOT_COMPONENT_ID,
          component: 'ProductList',
          products: {'@path': '/state/root/products'},
        },
      ],
    },
  },
  {
    version: '1.0',
    updateDataModel: {
      surfaceId: SURFACE_ID,
      path: '/state/root/products',
      value: [
        {
          ...WETSUIT,
          children: [WETSUIT, {...WETSUIT, permanentid: 'wetsuit-blue', ec_name: 'Wetsuit, blue'}],
          totalNumberOfChildren: 2,
        },
      ],
    },
  },
] as unknown as A2uiMessage[];

const MESSAGES = surfaceMessages(SURFACE_ID);

/** A session whose request in flight locks the surface, or that is idle. */
const LOCKED = requestSnapshot({kind: 'prompt', turnId: 'turn'});
const UNLOCKED = requestSnapshot(undefined);

function lockedSource(locked: boolean) {
  return {
    getSnapshot: () => (locked ? LOCKED : UNLOCKED),
    subscribe: () => () => {},
  };
}

const loading = (surfaceId: string) => [
  {surfaceId, rootComponentType: 'ProductCarousel', isLoading: true},
];

function Turn({
  interactive,
  locked = false,
  isStreaming = false,
  cart = createFakeCartStore(),
  messages = MESSAGES,
}: {
  interactive: boolean;
  locked?: boolean;
  isStreaming?: boolean;
  cart?: FakeCartStore;
  messages?: A2uiMessage[];
}) {
  return (
    <SessionRequestProvider value={lockedSource(locked)}>
      <CartProvider store={cart}>
        <ProductCardActionsContext.Provider value={renderProductCardCartActions}>
          <ThermidorA2UIStream catalog={CATALOG} messages={messages} onAction={ignoreAction}>
            <TurnSurfaces
              surfaces={makeSurfaces(SURFACE_ID)}
              latest={interactive}
              isStreaming={isStreaming}
            />
          </ThermidorA2UIStream>
        </ProductCardActionsContext.Provider>
      </CartProvider>
    </SessionRequestProvider>
  );
}

function renderTurnSurfaces(interactive: boolean) {
  return render(<Turn interactive={interactive} />);
}

/** The fieldset that holds the turn's surfaces. */
function turnFieldset() {
  return screen.getByRole('region', {name: `A2-UI surface ${SURFACE_ID}`}).closest('fieldset');
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

  it('disables the controls that act on an earlier turn and explains why', async () => {
    renderTurnSurfaces(false);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(isDisabled(pageSizeSelect())).toBe(true);
    expect(screen.getByRole('group', {name: NOTE})).toBeDefined();
  });

  it('keeps the products of an earlier turn open to the shopper', async () => {
    const cart = createFakeCartStore();
    render(<Turn interactive={false} cart={cart} messages={WITH_PRODUCTS} />);

    const addToCart = await screen.findByRole('button', {name: 'Add to cart, Wetsuit'});
    expect(isDisabled(addToCart)).toBe(false);
    addToCart.focus();
    expect(document.activeElement).toBe(addToCart);
    fireEvent.click(addToCart);
    expect(cart.add).toHaveBeenCalledWith(expect.objectContaining({productId: 'wetsuit'}), 1);
    expect(screen.getByRole('link', {name: 'Wetsuit'}).getAttribute('href')).toBe(
      'https://example.com/wetsuit'
    );
    expect(isDisabled(pageSizeSelect())).toBe(true);
  });

  it('promotes a child in an earlier turn', async () => {
    render(<Turn interactive={false} messages={WITH_GROUPED_LIST} />);

    const thumbnail = await screen.findByRole('button', {name: 'Wetsuit, blue'});
    expect(isDisabled(thumbnail)).toBe(false);
    fireEvent.click(thumbnail);

    expect(screen.getByRole('heading', {name: 'Wetsuit, blue'})).toBeDefined();
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
    expect(turnFieldset()?.getAttribute('aria-busy')).toBe('true');
    expect(screen.queryByText(NOTE)).toBeNull();
  });

  it('leaves an earlier turn read-only without marking it busy', async () => {
    render(<Turn interactive={false} locked />);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(turnFieldset()?.hasAttribute('aria-busy')).toBe(false);
  });

  it('dims the surface it disables', async () => {
    render(<Turn interactive locked />);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(turnFieldset()?.className).toMatch(/locked/);
  });

  it('disables the turn that streams without dimming it', async () => {
    render(<Turn interactive locked isStreaming />);

    await waitFor(() => expect(pageSizeSelect()).toBeDefined());
    expect(isDisabled(pageSizeSelect())).toBe(true);
    expect(turnFieldset()?.className).not.toMatch(/locked/);
  });

  it('enables the controls again once the request ends', async () => {
    const {rerender} = render(<Turn interactive locked />);
    await waitFor(() => expect(isDisabled(pageSizeSelect())).toBe(true));

    rerender(<Turn interactive />);

    expect(isDisabled(pageSizeSelect())).toBe(false);
    expect(turnFieldset()?.hasAttribute('aria-busy')).toBe(false);
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

  it('gives focus back to the control used last when two surface groups are interactive', async () => {
    const OTHER_SURFACE_ID = 'other-surface';
    const messages = [...MESSAGES, ...surfaceMessages(OTHER_SURFACE_ID)];
    function TwoGroups({locked}: {locked: boolean}) {
      return (
        <SessionRequestProvider value={lockedSource(locked)}>
          <ThermidorA2UIStream catalog={CATALOG} messages={messages} onAction={ignoreAction}>
            <TurnSurfaces surfaces={makeSurfaces(SURFACE_ID)} latest isStreaming={false} />
            <TurnSurfaces surfaces={makeSurfaces(OTHER_SURFACE_ID)} latest isStreaming={false} />
          </ThermidorA2UIStream>
        </SessionRequestProvider>
      );
    }
    const {rerender} = render(<TwoGroups locked={false} />);
    await waitFor(() => expect(screen.getAllByLabelText('Products per page:')).toHaveLength(2));
    const [first, second] = screen.getAllByLabelText('Products per page:') as HTMLSelectElement[];

    first.focus();
    first.blur();
    rerender(<TwoGroups locked />);
    rerender(<TwoGroups locked={false} />);
    second.focus();
    second.blur();
    rerender(<TwoGroups locked />);
    rerender(<TwoGroups locked={false} />);

    expect(document.activeElement).toBe(second);
  });
});

describe('TurnSurfaces loading placeholders', () => {
  function renderPlaceholder() {
    return render(
      <ThermidorA2UIStream catalog={CATALOG} messages={MESSAGES} onAction={ignoreAction}>
        <TurnSurfaces surfaces={loading(SURFACE_ID)} latest isStreaming />
      </ThermidorA2UIStream>
    );
  }

  it('draws the skeleton of a loading surface in its place', () => {
    renderPlaceholder();

    const section = screen.getByRole('region', {name: `A2-UI surface ${SURFACE_ID}`});
    expect(section.querySelector('[aria-label="Loading product carousel"]')).not.toBeNull();
    expect(screen.queryByLabelText('Products per page:')).toBeNull();
  });

  it('draws nothing when the turn lists no surface', () => {
    const {container} = render(
      <ThermidorA2UIStream catalog={CATALOG} messages={[]} onAction={ignoreAction}>
        <TurnSurfaces surfaces={[]} latest isStreaming={false} />
      </ThermidorA2UIStream>
    );

    expect(container.querySelector('fieldset')).toBeNull();
  });

  it('never scrolls the page as its surfaces are drawn, added or replaced', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const page = (surfaces: ReturnType<typeof makeSurfaces>) => (
      <ThermidorA2UIStream catalog={CATALOG} messages={MESSAGES} onAction={ignoreAction}>
        <TurnSurfaces surfaces={surfaces} latest isStreaming />
      </ThermidorA2UIStream>
    );
    const {rerender} = render(page([]));

    rerender(page(loading('placeholder')));
    rerender(page(makeSurfaces(SURFACE_ID)));
    rerender(page(makeSurfaces(SURFACE_ID, 'added')));

    expect(screen.getByRole('region', {name: `A2-UI surface ${SURFACE_ID}`})).toBeDefined();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('ThermidorA2UIStream', () => {
  it('feeds only the new messages of a stream that grows, keeping the surfaces drawn', async () => {
    const SECOND_ID = 'second-surface';
    const page = (messages: A2uiMessage[]) => (
      <SessionRequestProvider value={lockedSource(false)}>
        <ThermidorA2UIStream catalog={CATALOG} messages={messages} onAction={ignoreAction}>
          <TurnSurfaces surfaces={makeSurfaces(SURFACE_ID, SECOND_ID)} latest isStreaming={false} />
        </ThermidorA2UIStream>
      </SessionRequestProvider>
    );
    const {rerender} = render(page(MESSAGES));
    const first = await screen.findByLabelText('Products per page:');

    rerender(page([...MESSAGES, ...surfaceMessages(SECOND_ID)]));

    await waitFor(() => expect(screen.getAllByLabelText('Products per page:')).toHaveLength(2));
    expect(screen.getAllByLabelText('Products per page:')[0]).toBe(first);
  });

  it('skips a message the renderer rejects, applies the ones after it, and never retries it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const [create, ...valid] = surfaceMessages(SURFACE_ID);
    const placeholder = {
      version: '1.0',
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [{id: ROOT_COMPONENT_ID, component: 'BundleDisplay'}],
      },
    } as unknown as A2uiMessage;
    const messages = [create, placeholder, ...valid];
    const page = (stream: A2uiMessage[]) => (
      <SessionRequestProvider value={lockedSource(false)}>
        <ThermidorA2UIStream catalog={CATALOG} messages={stream} onAction={ignoreAction}>
          <TurnSurfaces surfaces={makeSurfaces(SURFACE_ID)} latest isStreaming={false} />
        </ThermidorA2UIStream>
      </SessionRequestProvider>
    );
    try {
      const {rerender} = render(page(messages));

      expect(
        ((await screen.findByLabelText('Products per page:')) as HTMLSelectElement).value
      ).toBe('24');
      const rejected = consoleError.mock.calls.filter(
        ([message]) => message === 'A2-UI message rejected by the renderer'
      );
      expect(rejected).toHaveLength(1);
      expect(rejected[0][2]).toBe(placeholder);

      rerender(
        page([
          ...messages,
          {
            version: '1.0',
            updateDataModel: {surfaceId: SURFACE_ID, path: '/state/root/pageSize', value: 48},
          } as unknown as A2uiMessage,
        ])
      );

      await waitFor(() =>
        expect((screen.getByLabelText('Products per page:') as HTMLSelectElement).value).toBe('48')
      );
      expect(consoleError).toHaveBeenCalledTimes(1);
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('the failure of an action', () => {
  /** A block with two page size selects, so a failure can show at one and not at the other. */
  const TWO_CONTROLS = [
    {
      version: '1.0',
      createSurface: {
        surfaceId: SURFACE_ID,
        catalogId: THERMIDOR_CATALOG_ID,
        components: [
          {id: ROOT_COMPONENT_ID, component: 'LayoutStack', children: ['first', 'second']},
          {id: 'first', component: 'PageSize', pageSize: {'@path': '/state/first/pageSize'}},
          {id: 'second', component: 'PageSize', pageSize: {'@path': '/state/second/pageSize'}},
        ],
      },
    },
    {
      version: '1.0',
      updateDataModel: {surfaceId: SURFACE_ID, path: '/state/first/pageSize', value: 24},
    },
    {
      version: '1.0',
      updateDataModel: {surfaceId: SURFACE_ID, path: '/state/second/pageSize', value: 24},
    },
  ] as unknown as A2uiMessage[];

  const failedPageSize = (overrides: Partial<ActionError> = {}): ActionError => ({
    message: 'Bad gateway',
    component: 'PageSize',
    name: 'setPageSize',
    surfaceId: SURFACE_ID,
    sourceComponentId: 'first',
    ...overrides,
  });

  function Block({
    source,
    onAction = ignoreAction,
  }: {
    source: SessionRequestSource;
    onAction?: (action: ActionPayload) => unknown;
  }) {
    return (
      <SessionRequestProvider value={source}>
        <ThermidorA2UIStream catalog={CATALOG} messages={TWO_CONTROLS} onAction={onAction}>
          <TurnSurfaces surfaces={makeSurfaces(SURFACE_ID)} latest isStreaming={false} />
        </ThermidorA2UIStream>
      </SessionRequestProvider>
    );
  }

  async function renderWithActionError(actionError: ActionError) {
    const snapshot = {...UNLOCKED, actionError};
    render(<Block source={{...lockedSource(false), getSnapshot: () => snapshot}} />);
    await waitFor(() => expect(pageSizeSelects()).toHaveLength(2));
  }

  const pageSizeSelects = () => screen.queryAllByLabelText('Products per page:');

  /** The controls of the component that holds `element`. */
  const componentOf = (element: Element) => element.closest('[data-surface-controls]');

  it('shows next to the component the action came from, and only there', async () => {
    await renderWithActionError(failedPageSize());
    const [first, second] = pageSizeSelects();

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Bad gateway');
    expect(componentOf(alert)).toBe(componentOf(first));
    expect(componentOf(alert)).not.toBe(componentOf(second));
  });

  it('shows under the block when the component the action came from is not drawn', async () => {
    await renderWithActionError(failedPageSize({sourceComponentId: 'removed'}));

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Bad gateway');
    expect(componentOf(alert)).toBeNull();
    expect(alert.parentElement).toBe(
      screen.getByRole('region', {name: `A2-UI surface ${SURFACE_ID}`})
    );
  });

  it('does not show for an action from another block', async () => {
    await renderWithActionError(failedPageSize({surfaceId: 'another-surface'}));

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('leaves the other components usable, and clears once the next action is answered', async () => {
    const send = vi
      .fn<(message: unknown) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Bad gateway'))
      .mockResolvedValue(undefined);
    const requests = createFakeSessionRequests(send as never, () => 'PageSize');
    render(<Block source={requests.source} onAction={(message) => requests.dispatch(message)} />);
    await waitFor(() => expect(pageSizeSelects()).toHaveLength(2));

    fireEvent.change(pageSizeSelects()[0], {target: {value: '48'}});

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Bad gateway');
    expect(componentOf(alert)).toBe(componentOf(pageSizeSelects()[0]));
    expect(isDisabled(pageSizeSelects()[1])).toBe(false);

    fireEvent.change(pageSizeSelects()[1], {target: {value: '12'}});

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(send).toHaveBeenCalledTimes(2);
  });
});
