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

  it('opens a saved conversation, and starts a new one', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    fireEvent.click(within(drawer()).getByRole('button', {name: 'New conversation'}));
    expect(app.session().turns).toEqual([]);

    fireEvent.click(entries()[0]);
    await waitFor(() => expect(app.session().turns).toHaveLength(1));
    expect(entries()[0].getAttribute('aria-current')).toBe('true');
  });

  it('deletes a saved conversation', async () => {
    const app = renderApp();
    await ask(app, 'surfboards');
    fireEvent.click(toggle());

    fireEvent.click(
      within(drawer()).getByRole('button', {name: 'Delete conversation: surfboards'})
    );

    expect(entries()).toEqual([]);
    expect(app.storage.list()).toEqual([]);
    expect(within(drawer()).getByText('No saved conversations yet.')).toBeDefined();
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
