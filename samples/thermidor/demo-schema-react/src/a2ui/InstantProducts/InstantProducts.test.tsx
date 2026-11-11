import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {CartProvider} from '../../cart/CartProvider.js';
import {SessionSearchBox} from '../../components/SessionSearchBox/SessionSearchBox.js';
import {createFakeCartStore, type FakeCartStore} from '../../test/fake-cart-store.js';
import {
  answerInstantProductsShell,
  createTestSession,
  findSearchBox,
  INSTANT_PRODUCTS_ID,
  instantProductsRun,
  renderWithSession,
  sseResponse,
  SHELL_SURFACE_ID,
  type ConverseHandler,
} from '../../test/session.js';
import {SUGGESTIONS_DEBOUNCE_MS} from '../QuerySuggestions/QuerySuggestions.js';
import {
  INSTANT_PRODUCTS_SETTLE_MS,
  INSTANT_PRODUCTS_TIMEOUT_MS,
  PRODUCTS_PANEL_MEDIA_QUERY,
} from './InstantProducts.js';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function stubScreen({wide}: {wide: boolean}) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: wide && query === PRODUCTS_PANEL_MEDIA_QUERY,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

const pause = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, SUGGESTIONS_DEBOUNCE_MS + 50)));

async function renderSearchBox({
  wide = true,
  handler = answerInstantProductsShell,
  cart,
}: {wide?: boolean; handler?: ConverseHandler; cart?: FakeCartStore} = {}) {
  stubScreen({wide});
  const onSubmit = vi.fn();
  const test = createTestSession(handler);
  const dispatchAction = vi.spyOn(test.session, 'dispatchAction');
  const searchBox = <SessionSearchBox onSubmit={onSubmit} busy={false} />;
  renderWithSession(
    cart ? <CartProvider store={cart}>{searchBox}</CartProvider> : searchBox,
    test.session
  );
  const textarea = await findSearchBox();
  textarea.focus();
  const type = (value: string) => fireEvent.change(textarea, {target: {value}});
  const dispatchedQueries = () =>
    dispatchAction.mock.calls
      .map(([message]) => ('userAction' in message ? message.userAction : undefined))
      .filter((action) => action?.name === 'fetchInstantProducts')
      .map((action) => action?.context?.['query']);
  const queriesSent = () =>
    test.actions('fetchInstantProducts').map(({context}) => context['query'] as string);
  return {...test, onSubmit, textarea, type, dispatchedQueries, queriesSent};
}

const options = () =>
  screen
    .queryAllByRole('option')
    .filter((option) => option.closest('#suggestions-listbox'))
    .map((option) => option.textContent);
const productsShown = () =>
  screen.queryByRole('region', {name: /^Products for/})?.getAttribute('aria-label');
const panelShown = () =>
  screen.queryByRole('region', {name: /products for/i})?.getAttribute('aria-label');

/** Answers like `answerInstantProductsShell`, holding back `fetchInstantProducts` for `query`. */
function holdingBack(query: string): {handler: ConverseHandler; release: () => void} {
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  return {
    release,
    handler: async (request) => {
      if (
        request.action?.name === 'fetchInstantProducts' &&
        request.action.context['query'] === query
      ) {
        await held;
      }
      return answerInstantProductsShell(request);
    },
  };
}

describe('InstantProducts', () => {
  it("shows the first completion's products once completions arrive", async () => {
    const {type, actions} = await renderSearchBox();

    type('surf');

    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    expect(screen.getByText('surf boards product')).toBeDefined();
    expect(actions('fetchInstantProducts')).toEqual([
      expect.objectContaining({
        surfaceId: SHELL_SURFACE_ID,
        sourceComponentId: INSTANT_PRODUCTS_ID,
        context: {query: 'surf boards'},
      }),
    ]);
  });

  it('follows the highlight with the arrow keys, once per change', async () => {
    const {type, textarea, dispatchedQueries} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});

    await waitFor(() => expect(productsShown()).toBe('Products for surf wax'));
    expect(dispatchedQueries()).toEqual(['surf boards', 'surf wax']);
  });

  it('returns to the first completion once new completions arrive', async () => {
    const {type, textarea, queriesSent} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    await waitFor(() => expect(productsShown()).toBe('Products for surf wax'));

    type('surfx');

    await waitFor(() => expect(productsShown()).toBe('Products for surfx boards'));
    expect(queriesSent()).toEqual(['surf boards', 'surf wax', 'surfx boards']);
  });

  it('follows the pointer, and answers a query seen again from the cache', async () => {
    const {type, queriesSent, dispatchedQueries} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));

    fireEvent.mouseEnter(screen.getByRole('option', {name: 'surf wax'}));
    await waitFor(() => expect(productsShown()).toBe('Products for surf wax'));
    fireEvent.mouseEnter(screen.getByRole('option', {name: 'surf boards'}));

    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    expect(dispatchedQueries()).toEqual(['surf boards', 'surf wax', 'surf boards']);
    expect(queriesSent()).toEqual(['surf boards', 'surf wax']);
  });

  it('sends only the highlight it settles on', async () => {
    const {type, dispatchedQueries, queriesSent} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));

    fireEvent.mouseEnter(screen.getByRole('option', {name: 'surf wax'}));
    await act(() => new Promise((resolve) => setTimeout(resolve, INSTANT_PRODUCTS_SETTLE_MS / 2)));
    fireEvent.mouseEnter(screen.getByRole('option', {name: 'surf boards'}));
    await pause();

    expect(dispatchedQueries()).not.toContain('surf wax');
    expect(queriesSent()).toEqual(['surf boards']);
  });

  it('draws no products answering another query than the highlighted one', async () => {
    const {type} = await renderSearchBox({
      handler: (request) =>
        request.action?.name === 'fetchInstantProducts'
          ? sseResponse(instantProductsRun(SHELL_SURFACE_ID, 'kayaks', ['kayak']))
          : answerInstantProductsShell(request),
    });

    type('surf');
    await waitFor(() => expect(options()).toEqual(['surf boards', 'surf wax']));
    await pause();

    expect(productsShown()).toBeUndefined();
    expect(screen.queryByText('kayak')).toBeNull();
  });

  it('sends nothing for an empty or blank query', async () => {
    const {type, dispatchedQueries} = await renderSearchBox();

    type('   ');
    await pause();

    expect(dispatchedQueries()).toEqual([]);
  });

  it('sends nothing once the input is submitted', async () => {
    const {type, textarea, onSubmit, dispatchedQueries} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));

    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
    fireEvent.focus(textarea);
    await pause();

    expect(onSubmit).toHaveBeenCalledWith('surf');
    expect(productsShown()).toBeUndefined();
    expect(dispatchedQueries()).toEqual(['surf boards']);
  });

  it('shows and sends nothing on small screens, where the suggestions stay', async () => {
    const {type, dispatchedQueries} = await renderSearchBox({wide: false});

    type('surf');
    await waitFor(() => expect(options()).toEqual(['surf boards', 'surf wax']));
    await pause();

    expect(productsShown()).toBeUndefined();
    expect(dispatchedQueries()).toEqual([]);
  });
  it('holds its place with a skeleton until the first answer', async () => {
    const {handler, release} = holdingBack('surf boards');
    const {type} = await renderSearchBox({handler});

    type('surf');

    await waitFor(() => expect(panelShown()).toBe('Loading products for surf boards'));
    expect(screen.getByLabelText('Loading products')).toBeDefined();
    release();
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    expect(screen.queryByLabelText('Loading products')).toBeNull();
  });

  it('keeps the previous products while the next highlight loads', async () => {
    const {handler, release} = holdingBack('surf wax');
    const {type} = await renderSearchBox({handler});
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));

    fireEvent.mouseEnter(screen.getByRole('option', {name: 'surf wax'}));

    await waitFor(() => expect(panelShown()).toBe('Loading products for surf wax'));
    expect(screen.getByText('surf boards product').closest('[inert]')).not.toBeNull();
    expect(screen.queryByLabelText('Loading products')).toBeNull();
    release();
    await waitFor(() => expect(productsShown()).toBe('Products for surf wax'));
    expect(screen.queryByText('surf boards product')).toBeNull();
  });

  it('says so when the highlighted query has no products', async () => {
    const {type} = await renderSearchBox({
      handler: (request) =>
        request.action?.name === 'fetchInstantProducts'
          ? sseResponse(
              instantProductsRun(SHELL_SURFACE_ID, String(request.action.context['query']), [])
            )
          : answerInstantProductsShell(request),
    });

    type('surf');

    await waitFor(() => expect(panelShown()).toBe('No products for surf boards'));
  });

  it('says there are no products when the answer never comes', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const {type} = await renderSearchBox({
      handler: (request) =>
        request.action?.name === 'fetchInstantProducts'
          ? new Promise<Response>(() => {})
          : answerInstantProductsShell(request),
    });
    type('surf');
    await waitFor(() => expect(panelShown()).toBe('Loading products for surf boards'));

    await act(() => vi.advanceTimersByTimeAsync(INSTANT_PRODUCTS_TIMEOUT_MS));

    expect(panelShown()).toBe('No products for surf boards');
  });
});

describe('InstantProducts keyboard navigation', () => {
  const productOptions = () =>
    screen
      .queryAllByRole('option')
      .filter((option) => option.closest('#suggestions-aside-listbox'));

  it('lists the products of the highlighted suggestion, which the right arrow reaches', async () => {
    const {type, textarea, dispatchedQueries} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    await waitFor(() => expect(productsShown()).toBe('Products for surf wax'));

    fireEvent.keyDown(textarea, {key: 'ArrowRight'});

    expect(
      screen.getByRole('listbox', {name: 'Instant products'}).contains(productOptions()[0])
    ).toBe(true);
    expect(textarea.getAttribute('aria-activedescendant')).toBe('instant-product-surf wax product');
    expect(productOptions()[0].getAttribute('aria-selected')).toBe('true');
    expect(productsShown()).toBe('Products for surf wax');
    expect(dispatchedQueries()).toEqual(['surf boards', 'surf wax']);
  });

  it('opens the highlighted product on Enter, as a click does', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    const {type, textarea, onSubmit} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowRight'});
    fireEvent.keyDown(textarea, {key: 'Enter'});

    expect(open).toHaveBeenCalledWith(
      'https://example.com/surf%20boards%20product',
      '_blank',
      'noopener,noreferrer'
    );
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.focus(textarea);
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    fireEvent.click(productOptions()[0]);
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('sends nothing more once the shopper comes back from an opened product', async () => {
    vi.stubGlobal('open', vi.fn());
    const {type, textarea, actions, queriesSent} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    await waitFor(() => expect(queriesSent()).toEqual(['surf boards', 'surf wax']));
    fireEvent.keyDown(textarea, {key: 'ArrowRight'});
    fireEvent.keyDown(textarea, {key: 'Enter'});

    fireEvent.blur(textarea);
    fireEvent.focus(textarea);
    await pause();

    expect(actions('fetchSuggestions').map(({context}) => context['query'])).toEqual(['', 'surf']);
    expect(queriesSent()).toEqual(['surf boards', 'surf wax']);
    expect(productsShown()).toBe('Products for surf wax');
  });

  it('leaves the right arrow to the caret on small screens', async () => {
    const {type, textarea} = await renderSearchBox({wide: false});
    type('surf');
    await waitFor(() => expect(options()).toEqual(['surf boards', 'surf wax']));
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});

    expect(fireEvent.keyDown(textarea, {key: 'ArrowRight'})).toBe(true);
    expect(textarea.getAttribute('aria-activedescendant')).toBe('suggestion-item-completion-0');
  });
});

describe('InstantProducts add to cart', () => {
  const PRICE = 25;
  const answerPricedProducts: ConverseHandler = (request) =>
    request.action?.name === 'fetchInstantProducts'
      ? sseResponse(
          instantProductsRun(
            SHELL_SURFACE_ID,
            String(request.action.context['query']),
            ['board', 'leash'],
            PRICE
          )
        )
      : answerInstantProductsShell(request);
  const productOption = (name: string) =>
    screen
      .getAllByRole('option')
      .find((option) => option.id === `instant-product-${name}`) as HTMLElement;

  async function renderWithCart(cart = createFakeCartStore()) {
    const rendered = await renderSearchBox({handler: answerPricedProducts, cart});
    rendered.type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));
    return {...rendered, cart};
  }

  function press(button: HTMLElement) {
    fireEvent.pointerDown(button);
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);
  }

  it('shows a control beside each product option, not inside it', async () => {
    await renderWithCart();

    const button = screen.getByRole('button', {name: 'Add to cart, board'});
    const option = productOption('board');
    expect(option.contains(button)).toBe(false);
    expect(option.parentElement?.contains(button)).toBe(true);
    expect(option.parentElement?.getAttribute('role')).toBe('presentation');
  });

  it('adds the product without opening it, closing the popover or taking the focus', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    const {cart, textarea} = await renderWithCart();

    press(screen.getByRole('button', {name: 'Add to cart, board'}));

    expect(cart.add).toHaveBeenCalledWith(
      {
        productId: 'board',
        name: 'board',
        imageUrl: undefined,
        clickUri: 'https://example.com/board',
        unitPrice: PRICE,
      },
      1
    );
    expect(open).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(textarea);
    expect(productsShown()).toBe('Products for surf boards');
  });

  it('leaves the highlighted option alone when the control is hovered or pressed', async () => {
    vi.stubGlobal('open', vi.fn());
    const {textarea} = await renderWithCart();
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowRight'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('instant-product-board');

    const button = screen.getByRole('button', {name: 'Add to cart, leash'});
    fireEvent.pointerEnter(button);
    fireEvent.mouseEnter(button);
    fireEvent.mouseOver(button);
    press(button);

    expect(textarea.getAttribute('aria-activedescendant')).toBe('instant-product-board');
    expect(productOption('board').getAttribute('aria-selected')).toBe('true');
    expect(productOption('leash').getAttribute('aria-selected')).toBe('false');
  });

  it('keeps the arrow keys and Enter on the product options', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    const {textarea, cart} = await renderWithCart();

    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    fireEvent.keyDown(textarea, {key: 'ArrowRight'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('instant-product-board');
    fireEvent.keyDown(textarea, {key: 'ArrowDown'});
    expect(textarea.getAttribute('aria-activedescendant')).toBe('instant-product-leash');
    expect(productOption('leash').getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(textarea, {key: 'Enter'});

    expect(open).toHaveBeenCalledWith('https://example.com/leash', '_blank', 'noopener,noreferrer');
    expect(cart.add).not.toHaveBeenCalled();
  });

  it('shows no control outside a cart', async () => {
    const {type} = await renderSearchBox({handler: answerPricedProducts});
    type('surf');
    await waitFor(() => expect(productsShown()).toBe('Products for surf boards'));

    expect(screen.queryByRole('button', {name: /cart/})).toBeNull();
  });
});
