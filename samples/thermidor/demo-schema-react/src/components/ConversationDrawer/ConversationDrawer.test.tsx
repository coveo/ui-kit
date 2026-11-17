import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {CartProvider} from '../../cart/CartProvider.js';
import {SessionProvider, useSession, type DemoSession} from '../../context/session.js';
import {createConversationStorage} from '../../conversations/conversation-storage.js';
import {createFakeCartStore} from '../../test/fake-cart-store.js';
import {memoryStorage} from '../../test/memory-storage.js';
import {createTestSessionFactory} from '../../test/session.js';
import {AppShell} from '../AppShell.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderApp() {
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
      <SessionProvider createSession={createTestSessionFactory().create} storage={storage}>
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

  it('cancels a rename on Escape, leaving the drawer open', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    rename('surfboards', 'Board shopping', (input) => fireEvent.keyDown(input, {key: 'Escape'}));

    expect(entries().map((entry) => entry.textContent)).toEqual(['surfboards']);
    expect(app.storage.list().map(({title}) => title)).toEqual(['surfboards']);
    await waitFor(() => expect(document.activeElement).toBe(options('surfboards')));
  });

  it('closes on a narrow screen once a conversation opens, or on a press outside', async () => {
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
  });

  it('closes on Escape, giving the focus back to its toggle', () => {
    renderApp();
    fireEvent.click(toggle());

    fireEvent.keyDown(within(drawer()).getByRole('button', {name: 'New conversation'}), {
      key: 'Escape',
    });

    expect(screen.queryByRole('navigation', {name: 'Conversations'})).toBeNull();
    expect(document.activeElement).toBe(toggle());
  });
});
