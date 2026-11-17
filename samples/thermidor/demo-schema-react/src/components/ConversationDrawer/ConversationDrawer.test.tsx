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

/** Opens the menu of the conversation titled `title`, and returns its `item`. */
function menuItem(title: string, item: string) {
  fireEvent.click(within(drawer()).getByRole('button', {name: `Options for ${title}`}));
  return screen.getByRole('menuitem', {name: item});
}

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

  it('opens a saved conversation, and deletes one from its menu', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));

    fireEvent.click(entries()[0]);
    expect(app.session().turns).toHaveLength(1);

    fireEvent.click(menuItem('surfboards', 'Delete'));
    expect(within(drawer()).getByText('No saved conversations yet.')).toBeDefined();
  });

  it('closes the menu on Escape, giving the focus back to its button, or on a press outside', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());
    const options = within(drawer()).getByRole('button', {name: 'Options for surfboards'});

    fireEvent.click(options);
    fireEvent.keyDown(screen.getByRole('menuitem', {name: 'Rename'}), {key: 'Escape'});
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(options);
    expect(drawer()).toBeDefined();

    fireEvent.click(options);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renames a conversation in place, keeping the new title through later saves', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    fireEvent.click(menuItem('surfboards', 'Rename'));
    const input = screen.getByRole('textbox', {name: 'Conversation title'});
    fireEvent.change(input, {target: {value: 'Board shopping'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    await ask(app, 'wetsuits');

    expect(entries().map((entry) => entry.textContent)).toEqual(['Board shopping']);
    expect(app.storage.list().map(({title}) => title)).toEqual(['Board shopping']);
  });

  it('cancels a rename on Escape, leaving the drawer open', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    fireEvent.click(menuItem('surfboards', 'Rename'));
    const input = screen.getByRole('textbox', {name: 'Conversation title'});
    fireEvent.change(input, {target: {value: 'Board shopping'}});
    fireEvent.keyDown(input, {key: 'Escape'});

    expect(entries().map((entry) => entry.textContent)).toEqual(['surfboards']);
    expect(app.storage.list().map(({title}) => title)).toEqual(['surfboards']);
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
