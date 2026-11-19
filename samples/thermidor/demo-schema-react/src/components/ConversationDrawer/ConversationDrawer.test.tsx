import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {CartProvider} from '../../cart/CartProvider.js';
import {SessionProvider, useSession, type DemoSession} from '../../context/session.js';
import {createConversationStorage} from '../../conversations/conversation-storage.js';
import {createFakeCartStore} from '../../test/fake-cart-store.js';
import {memoryStorage} from '../../test/memory-storage.js';
import {
  answerShell,
  createTestSessionFactory,
  findSearchBox,
  run,
  shellRun,
  sseResponse,
  type ConverseHandler,
} from '../../test/session.js';
import {AppShell} from '../AppShell.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderApp(handler?: ConverseHandler) {
  const local = memoryStorage();
  const tab = memoryStorage();
  const storage = createConversationStorage({local: () => local, session: () => tab});
  let session: DemoSession | undefined;
  function Probe() {
    session = useSession();
    return null;
  }
  render(
    <CartProvider store={createFakeCartStore()}>
      <SessionProvider createSession={createTestSessionFactory(handler).create} storage={storage}>
        <Probe />
        <AppShell />
      </SessionProvider>
    </CartProvider>
  );
  return {storage, session: () => session!};
}

async function ask({session}: ReturnType<typeof renderApp>, prompt: string) {
  await act(() => session().dispatchAction({name: 'submitPrompt', payload: {prompt}}));
}

const NOT_READY = 'Available once the conversation is ready';

/**
 * Whether "New conversation" shows that it waits: busy, and described by why. The reason is
 * `hidden`, so browse mode doesn't read it; a reason left in the page reads as "visible".
 */
function waits(newConversation: HTMLElement) {
  const id = newConversation.getAttribute('aria-describedby');
  const reason = id && document.getElementById(id);
  return {
    busy: newConversation.getAttribute('aria-busy') === 'true',
    reason: reason && (reason.hidden ? reason.textContent : 'visible'),
  };
}

const toggle = () => screen.getByRole('button', {name: 'Conversations'});
const drawer = () => screen.getByRole('navigation', {name: 'Conversations'});
const entries = () =>
  within(drawer())
    .queryAllByRole('listitem')
    .map((item) => within(item).getAllByRole('button')[0]);

describe('ConversationDrawer', () => {
  it('opens from the top bar, listing the saved conversations newest first', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));
    await ask(app, 'wetsuits');

    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(entries().map((entry) => entry.textContent)).toEqual(['wetsuits', 'surfboards']);
    expect(entries().map((entry) => entry.getAttribute('aria-current'))).toEqual(['true', null]);
  });

  it('opens a saved conversation', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));

    fireEvent.click(entries()[0]);
    expect(app.session().turns.map(({input}) => input.prompt)).toEqual(['surfboards']);
  });

  it('closes on a narrow screen once a conversation opens, on a press outside, or when the focus leaves it', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({matches: true, media: query, addEventListener() {}, removeEventListener() {}}) as never
    );
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));
    expect(screen.queryByRole('navigation', {name: 'Conversations'})).toBeNull();
    expect(document.activeElement).toBe(toggle());

    fireEvent.click(toggle());
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('navigation', {name: 'Conversations'})).toBeNull();

    fireEvent.click(toggle());
    fireEvent.blur(within(drawer()).getByRole('button', {name: 'New conversation'}), {
      relatedTarget: screen.getByLabelText('Prompt'),
    });
    expect(screen.queryByRole('navigation', {name: 'Conversations'})).toBeNull();
  });

  it.each([
    ['in it', () => within(drawer()).getByRole('button', {name: 'New conversation'})],
    ['on its toggle, right after opening it', toggle],
  ])('closes on Escape %s, giving the focus back to its toggle', (_where, target) => {
    renderApp();
    fireEvent.click(toggle());

    fireEvent.keyDown(target(), {key: 'Escape'});

    expect(screen.queryByRole('navigation', {name: 'Conversations'})).toBeNull();
    expect(document.activeElement).toBe(toggle());
  });

  it('keeps the running conversation while it answers', async () => {
    let finish = () => {};
    const app = renderApp((request, signal) =>
      request.message === 'boots'
        ? new Promise((resolve) => (finish = () => resolve(sseResponse(run([])))))
        : answerShell(request, signal)
    );
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));
    await ask(app, 'wetsuits');
    void app.session().dispatchAction({name: 'submitPrompt', payload: {prompt: 'boots'}});
    const newConversation = within(drawer()).getByRole('button', {name: 'New conversation'});
    await waitFor(() => expect(newConversation.getAttribute('aria-disabled')).toBe('true'));

    expect(waits(newConversation)).toEqual({busy: true, reason: NOT_READY});
    expect(entries()[1].title).toBe(NOT_READY);
    expect(entries().map((entry) => entry.getAttribute('aria-disabled'))).toEqual([null, 'true']);
    fireEvent.click(newConversation);
    fireEvent.click(entries()[1]);
    expect(app.session().turns.map(({input}) => input.prompt)).toEqual(['wetsuits', 'boots']);

    await act(async () => finish());
    await waitFor(() => expect(newConversation.getAttribute('aria-disabled')).toBeNull());
    expect(waits(newConversation)).toEqual({busy: false, reason: null});
  });

  it('waits while the session opens', async () => {
    let open = () => {};
    renderApp((request, signal) =>
      request.action?.name === 'initialize'
        ? new Promise((resolve) => (open = () => resolve(sseResponse(shellRun()))))
        : answerShell(request, signal)
    );
    fireEvent.click(toggle());
    const newConversation = within(drawer()).getByRole('button', {name: 'New conversation'});
    await waitFor(() => expect(newConversation.getAttribute('aria-disabled')).toBe('true'));
    expect(waits(newConversation)).toEqual({busy: true, reason: NOT_READY});

    await act(async () => open());

    await waitFor(() => expect(newConversation.getAttribute('aria-disabled')).toBeNull());
  });

  it.each([
    ['fails', (app: ReturnType<typeof renderApp>, fail: () => void) => fail()],
    ['is cancelled', (app: ReturnType<typeof renderApp>) => app.session().cancel()],
  ])('is ready again once the request %s', async (_name, end) => {
    let fail = () => {};
    const app = renderApp((request, signal) =>
      request.message === 'boots'
        ? new Promise((resolve, reject) => {
            fail = () => resolve(new Response('Unavailable', {status: 503}));
            signal?.addEventListener('abort', () =>
              reject(new DOMException('The request was aborted.', 'AbortError'))
            );
          })
        : answerShell(request, signal)
    );
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    void app.session().dispatchAction({name: 'submitPrompt', payload: {prompt: 'boots'}});
    const newConversation = within(drawer()).getByRole('button', {name: 'New conversation'});
    await waitFor(() => expect(newConversation.getAttribute('aria-disabled')).toBe('true'));

    act(() => end(app, fail));

    await waitFor(() => expect(newConversation.getAttribute('aria-disabled')).toBeNull());
    expect(waits(newConversation)).toEqual({busy: false, reason: null});
  });

  it('lists a conversation from its first prompt, and waits while it answers', async () => {
    let finish = () => {};
    const app = renderApp((request, signal) =>
      request.message === 'life jackets'
        ? new Promise((resolve) => (finish = () => resolve(sseResponse(run([])))))
        : answerShell(request, signal)
    );
    fireEvent.click(toggle());
    const newConversation = within(drawer()).getByRole('button', {name: 'New conversation'});
    const textarea = await findSearchBox();
    await waitFor(() => expect(waits(newConversation).busy).toBe(false));

    fireEvent.change(textarea, {target: {value: 'life jackets'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    await waitFor(() => expect(waits(newConversation)).toEqual({busy: true, reason: NOT_READY}));
    expect(entries().map((entry) => entry.textContent)).toEqual(['life jackets']);
    expect(entries()[0].getAttribute('aria-current')).toBe('true');
    const [{id}] = app.storage.list();
    expect(app.storage.load(id)).toBeUndefined();

    await act(async () => finish());
    await waitFor(() => expect(waits(newConversation).busy).toBe(false));
    expect(app.storage.list().map(({title}) => title)).toEqual(['life jackets']);
    expect(app.storage.load(id)?.turns).toHaveLength(1);
  });
});
