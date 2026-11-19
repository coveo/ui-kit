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
  sseResponse,
  run,
  findSearchBox,
  shellRun,
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

/** Whether "New conversation" shows that it waits: busy, and described by why, out of sight. */
function waits(newConversation: HTMLElement) {
  const reason = newConversation.getAttribute('aria-describedby');
  return {
    busy: newConversation.getAttribute('aria-busy') === 'true',
    reason: reason && document.getElementById(reason)?.textContent,
  };
}

const toggle = () => screen.getByRole('button', {name: 'Conversations'});
const drawer = () => screen.getByRole('navigation', {name: 'Conversations'});
const entries = () =>
  within(drawer())
    .queryAllByRole('listitem')
    .map((item) => within(item).getAllByRole('button')[0]);

const options = (title: string) =>
  within(drawer()).getByRole('button', {name: `Options for ${title}`});
const menu = (title: string) => screen.queryByRole('group', {name: `Options for ${title}`});

/** Opens the menu of the conversation titled `title`, and returns its `item`. */
function menuItem(title: string, item: string) {
  fireEvent.click(options(title));
  return within(menu(title)!).getByRole('button', {name: item});
}

/** Renames the conversation titled `title` to `value`, ending with `end`. */
function rename(title: string, value: string, end: (input: HTMLElement) => void) {
  fireEvent.click(menuItem(title, 'Rename'));
  const input = screen.getByRole('textbox', {name: 'Conversation title'});
  fireEvent.change(input, {target: {value}});
  end(input);
}

const pressEnter = (input: HTMLElement) => fireEvent.keyDown(input, {key: 'Enter'});

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

  it('opens a saved conversation, and deletes it from its menu, focusing the next row', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));
    await ask(app, 'wetsuits');

    fireEvent.click(entries()[1]);
    expect(app.session().turns.map(({input}) => input.prompt)).toEqual(['surfboards']);

    fireEvent.click(menuItem('wetsuits', 'Delete'));
    expect(entries().map((entry) => entry.textContent)).toEqual(['surfboards']);
    expect(document.activeElement).toBe(entries()[0]);
  });

  it('starts a new conversation when the current one is deleted, focusing "New conversation"', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    fireEvent.click(menuItem('surfboards', 'Delete'));

    expect(app.session().turns).toEqual([]);
    expect(within(drawer()).getByText('No saved conversations yet.')).toBeDefined();
    expect(document.activeElement).toBe(
      within(drawer()).getByRole('button', {name: 'New conversation'})
    );
  });

  it('closes the menu on Escape, a press outside, or focus leaving its row', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));
    await ask(app, 'wetsuits');

    fireEvent.keyDown(menuItem('surfboards', 'Rename'), {key: 'Escape'});
    expect(menu('surfboards')).toBeNull();
    expect(document.activeElement).toBe(options('surfboards'));
    expect(drawer()).toBeDefined();

    fireEvent.click(options('surfboards'));
    fireEvent.pointerDown(document.body);
    expect(menu('surfboards')).toBeNull();

    const rename = menuItem('surfboards', 'Rename');
    fireEvent.blur(rename, {relatedTarget: options('wetsuits')});
    expect(menu('surfboards')).toBeNull();
  });

  it('renames a conversation in place on Enter, giving the focus back to its menu button', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    rename('surfboards', '  Board shopping ', pressEnter);

    expect(entries().map((entry) => entry.textContent)).toEqual(['Board shopping']);
    expect(app.storage.list().map(({title}) => title)).toEqual(['Board shopping']);
    await waitFor(() => expect(document.activeElement).toBe(options('Board shopping')));
  });

  it('saves a rename once the field loses focus, and ignores a blank one', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    rename('surfboards', '   ', pressEnter);
    expect(entries().map((entry) => entry.textContent)).toEqual(['surfboards']);

    rename('surfboards', 'Board shopping', (input) => fireEvent.blur(input));
    expect(entries().map((entry) => entry.textContent)).toEqual(['Board shopping']);
  });

  it('saves a rename when a press outside closes the drawer on a narrow screen', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({matches: true, media: query, addEventListener() {}, removeEventListener() {}}) as never
    );
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    rename('surfboards', 'Board shopping', () => fireEvent.pointerDown(document.body));

    expect(screen.queryByRole('navigation', {name: 'Conversations'})).toBeNull();
    expect(app.storage.list().map(({title}) => title)).toEqual(['Board shopping']);
  });

  it('cancels a rename on Escape, leaving the drawer open, but not while an IME composes', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    rename('surfboards', 'Board shopping', (input) => {
      fireEvent.keyDown(input, {key: 'Enter', isComposing: true});
      fireEvent.keyDown(input, {key: 'Escape', isComposing: true});
      expect(screen.getByRole('textbox', {name: 'Conversation title'})).toBe(input);
      expect(drawer()).toBeTruthy();
      fireEvent.keyDown(input, {key: 'Escape'});
    });

    expect(entries().map((entry) => entry.textContent)).toEqual(['surfboards']);
    expect(app.storage.list().map(({title}) => title)).toEqual(['surfboards']);
    await waitFor(() => expect(document.activeElement).toBe(options('surfboards')));
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

  it('keeps the running conversation while it answers, renaming and deleting the others', async () => {
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
    expect(menuItem('wetsuits', 'Delete').getAttribute('aria-disabled')).toBe('true');
    fireEvent.keyDown(document.activeElement!, {key: 'Escape'});

    rename('surfboards', 'Board shopping', pressEnter);
    fireEvent.click(menuItem('Board shopping', 'Delete'));
    expect(entries().map((entry) => entry.textContent)).toEqual(['wetsuits']);

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
    expect(menuItem('life jackets', 'Delete').getAttribute('aria-disabled')).toBe('true');
    const [{id}] = app.storage.list();
    expect(app.storage.load(id)).toBeUndefined();

    await act(async () => finish());
    await waitFor(() => expect(waits(newConversation).busy).toBe(false));
    expect(app.storage.list().map(({title}) => title)).toEqual(['life jackets']);
    expect(app.storage.load(id)?.turns).toHaveLength(1);
  });
});
