import {act, render, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Cart, CartLine} from '../cart/cart-api.js';
import {CartProvider} from '../cart/CartProvider.js';
import {createCartStore, EMPTY_CART, type CartClient} from '../cart/cart-store.js';
import {createConversationStorage} from '../conversations/conversation-storage.js';
import {memoryStorage} from '../test/memory-storage.js';
import {
  answerShell,
  createTestSessionFactory,
  run,
  shellRun,
  sseResponse,
  type ConverseHandler,
} from '../test/session.js';
import {
  SessionProvider,
  useConversations,
  useSession,
  type Conversations,
  type DemoSession,
} from './session.js';

interface RequestBody {
  action: {name: string} | null;
  context: {cart: unknown[]};
}

function line(productId: string, unitPrice: number, quantity: number): CartLine {
  return {
    productId,
    name: `${productId} name`,
    imageUrl: `https://example.com/${productId}.png`,
    clickUri: `https://example.com/${productId}`,
    unitPrice,
    quantity,
    lineTotal: unitPrice * quantity,
  };
}

function cartOf(...items: CartLine[]): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    currency: 'USD',
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    total: subtotal,
  };
}

function stubConverse() {
  const bodies: RequestBody[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as RequestBody;
      bodies.push(body);
      return answerShell(body as never);
    })
  );
  return bodies;
}

function renderSession(client: CartClient) {
  const store = createCartStore(client);
  let session: DemoSession | undefined;
  function Probe() {
    session = useSession();
    return null;
  }
  render(
    <CartProvider store={store}>
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </CartProvider>
  );
  return {store, session: () => session!};
}

describe('SessionProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("sends the cart's items with every request, in context.cart", async () => {
    const bodies = stubConverse();
    const board = line('gid://shopify/ProductVariant/1', 199.99, 1);
    const wax = line('wax', 4.5, 2);
    const client: CartClient = {
      getCart: vi.fn(async () => cartOf(board)),
      addItem: vi.fn(async () => cartOf(board, wax)),
      removeItem: vi.fn(async () => EMPTY_CART),
      purchase: vi.fn(),
    };
    const {store, session} = renderSession(client);
    await store.load();
    await waitFor(() => expect(bodies.map(({action}) => action?.name)).toContain('initialize'));

    await store.add({productId: 'wax', name: 'wax name', unitPrice: 4.5}, 2);
    await session().dispatchAction({name: 'submitPrompt', payload: {prompt: 'wetsuits'}});

    expect(bodies.at(-1)?.context.cart).toEqual([
      {productId: board.productId, name: board.name, price: 199.99, quantity: 1},
      {productId: 'wax', name: 'wax name', price: 4.5, quantity: 2},
    ]);
  });

  it('sends the cart the page embedded with its first request, initialize', async () => {
    const bodies = stubConverse();
    const wax = line('wax', 4.5, 2);
    window.__DEMO_CART__ = cartOf(wax);
    try {
      render(
        <CartProvider>
          <SessionProvider />
        </CartProvider>
      );

      await waitFor(() => expect(bodies).toHaveLength(1));
      expect(bodies[0].action?.name).toBe('initialize');
      expect(bodies[0].context.cart).toEqual([
        {productId: 'wax', name: 'wax name', price: 4.5, quantity: 2},
      ]);
      expect(vi.mocked(fetch).mock.calls.map(([url]) => String(url))).not.toContain('/api/cart');
    } finally {
      delete window.__DEMO_CART__;
    }
  });

  it('throws without a session or a CartProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<SessionProvider />)).toThrow(
      'SessionProvider must be used within a CartProvider, or be given a session'
    );
  });
});

/** A browser whose tabs share `localStorage` and each have their own `sessionStorage`. */
function browser() {
  const local = memoryStorage();
  return {
    local,
    tab: () => {
      const session = memoryStorage();
      return createConversationStorage({local: () => local, session: () => session});
    },
  };
}

function renderConversations(
  storage: ReturnType<ReturnType<typeof browser>['tab']>,
  handler: ConverseHandler = answerShell
) {
  const {create, requests} = createTestSessionFactory(handler);
  let session: DemoSession | undefined;
  let conversations: Conversations | undefined;
  function Probe() {
    session = useSession();
    conversations = useConversations();
    return null;
  }
  const view = render(
    <SessionProvider createSession={create} storage={storage}>
      <Probe />
    </SessionProvider>
  );
  return {view, requests, session: () => session!, conversations: () => conversations!};
}

async function ask(session: DemoSession, prompt: string) {
  await act(() => session.dispatchAction({name: 'submitPrompt', payload: {prompt}}));
}

describe('SessionProvider conversations', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves the conversation once a turn completes, titled by its first prompt', async () => {
    const tab = browser().tab();
    const {session, conversations} = renderConversations(tab);

    await ask(session(), 'surfboards');
    await ask(session(), 'wetsuits');

    expect(conversations().list).toEqual([
      {id: conversations().currentId, title: 'surfboards', updatedAt: expect.any(Number)},
    ]);
    expect(tab.load(conversations().currentId)?.turns).toHaveLength(2);
  });

  it('resumes the current conversation on reload', async () => {
    const tab = browser().tab();
    const first = renderConversations(tab);
    await ask(first.session(), 'surfboards');
    const id = first.conversations().currentId;
    first.view.unmount();

    const reloaded = renderConversations(tab);

    expect(reloaded.conversations().currentId).toBe(id);
    expect(reloaded.session().turns.map(({input}) => input.prompt)).toEqual(['surfboards']);
    await waitFor(() =>
      expect(reloaded.requests.at(-1)).toMatchObject({
        action: {name: 'initialize'},
        conversationSessionId: 'session-1',
      })
    );
  });

  it('starts a new conversation in a new tab, keeping the saved ones', async () => {
    const shared = browser();
    const first = renderConversations(shared.tab());
    await ask(first.session(), 'surfboards');
    first.view.unmount();

    const fresh = renderConversations(shared.tab());

    expect(fresh.session().turns).toEqual([]);
    expect(fresh.conversations().list.map(({title}) => title)).toEqual(['surfboards']);
  });

  it('starts a new conversation, and drops the current one, when it cannot be restored', () => {
    const tab = browser().tab();
    tab.save('broken', 'surfboards', {version: 999, turns: []});
    tab.setCurrentId('broken');

    const {session, conversations} = renderConversations(tab);

    expect(session().turns).toEqual([]);
    expect(conversations().currentId).not.toBe('broken');
    expect(tab.list()).toEqual([]);
  });

  it('switches between new and saved conversations, and removes them', async () => {
    const tab = browser().tab();
    const {session, conversations} = renderConversations(tab);
    await ask(session(), 'surfboards');
    const saved = conversations().currentId;

    act(() => conversations().start());
    expect(session().turns).toEqual([]);
    expect(conversations().currentId).not.toBe(saved);

    act(() => conversations().open(saved));
    expect(conversations().currentId).toBe(saved);
    expect(session().turns).toHaveLength(1);

    act(() => conversations().remove(saved));
    expect(conversations().list).toEqual([]);
    expect(conversations().currentId).not.toBe(saved);
    expect(session().turns).toEqual([]);
  });

  it('saves a resumed conversation the server replaced as a new one', async () => {
    const tab = browser().tab();
    const first = renderConversations(tab);
    await ask(first.session(), 'surfboards');
    const original = first.conversations().currentId;
    first.view.unmount();

    const replacedKeys = {conversationSessionId: 'session-2', conversationToken: 'token-2'};
    const replaced = (events: object[]) =>
      sseResponse(
        events.map((event) => ('threadId' in event ? {...event, ...replacedKeys} : event))
      );
    const {session, conversations} = renderConversations(tab, (request) =>
      replaced(request.action?.name === 'initialize' ? shellRun() : run([]))
    );
    await waitFor(() => expect(conversations().currentId).not.toBe(original));
    await ask(session(), 'wetsuits');

    expect(conversations().list.map(({title}) => title)).toEqual(['wetsuits', 'surfboards']);
    expect(tab.load(original)?.turns.map(({input}) => input.prompt)).toEqual(['surfboards']);
  });

  it('keeps saving a resumed conversation under its id when a prompt answers with new keys', async () => {
    const tab = browser().tab();
    const first = renderConversations(tab);
    await ask(first.session(), 'surfboards');
    const original = first.conversations().currentId;
    first.view.unmount();

    const newKeys = {conversationSessionId: 'session-2', conversationToken: 'token-2'};
    const {session, conversations, requests} = renderConversations(tab, (request, signal) =>
      typeof request.message === 'string'
        ? sseResponse(
            run([]).map((event) => ('threadId' in event ? {...event, ...newKeys} : event))
          )
        : answerShell(request, signal)
    );
    await waitFor(() => expect(requests.at(-1)?.action?.name).toBe('initialize'));
    await ask(session(), 'wetsuits');
    await ask(session(), 'boots');

    expect(conversations().currentId).toBe(original);
    expect(tab.list().map(({id}) => id)).toEqual([original]);
    expect(tab.load(original)?.turns.map(({input}) => input.prompt)).toEqual([
      'surfboards',
      'wetsuits',
      'boots',
    ]);
  });

  it('drops the current conversation from the list when its save is gone', () => {
    const shared = browser();
    const tab = shared.tab();
    tab.save('gone', 'surfboards', {version: 4, turns: []});
    tab.setCurrentId('gone');
    shared.local.setItem('demo-conversation:gone', '{not json');

    const {conversations} = renderConversations(tab);

    expect(conversations().currentId).not.toBe('gone');
    expect(tab.list()).toEqual([]);
  });

  it('saves the turn a swap stops', async () => {
    const tab = browser().tab();
    const {session, conversations} = renderConversations(tab, (request, signal) =>
      request.message === 'wetsuits'
        ? new Promise<Response>((_resolve, reject) =>
            signal?.addEventListener('abort', () =>
              reject(new DOMException('The request was aborted.', 'AbortError'))
            )
          )
        : answerShell(request, signal)
    );
    await ask(session(), 'surfboards');
    const original = conversations().currentId;
    void session().dispatchAction({name: 'submitPrompt', payload: {prompt: 'wetsuits'}});
    await waitFor(() => expect(session().getSnapshot().request?.kind).toBe('prompt'));

    act(() => conversations().start());

    await waitFor(() =>
      expect(tab.load(original)?.turns.map(({input}) => input.prompt)).toEqual([
        'surfboards',
        'wetsuits',
      ])
    );
  });

  it('drops a conversation reloaded before its first turn was saved, and starts a new one', async () => {
    const tab = browser().tab();
    const first = renderConversations(tab, (request, signal) =>
      request.message === 'surfboards'
        ? new Promise<Response>(() => {})
        : answerShell(request, signal)
    );
    void first.session().dispatchAction({name: 'submitPrompt', payload: {prompt: 'surfboards'}});
    await waitFor(() =>
      expect(first.conversations().list.map(({title}) => title)).toEqual(['surfboards'])
    );
    const listed = first.conversations().currentId;
    first.view.unmount();

    const reloaded = renderConversations(tab);

    expect(reloaded.conversations().currentId).not.toBe(listed);
    expect(reloaded.session().turns).toEqual([]);
    expect(tab.list()).toEqual([]);
  });
});
