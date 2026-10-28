import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {SerializedSession} from '@coveo/thermidor';
import {useState} from 'react';
import {SessionProvider, useConversations, useSession} from './session.js';
import {keepCurrentConversation, readCurrentConversation} from './current-conversation.js';

const keptConversation: SerializedSession = {
  version: 2,
  sessionId: 'session-1',
  turns: [
    {
      id: 'turn-1',
      input: {prompt: 'What is Coveo?'},
      status: 'complete',
      response: {activities: []},
    },
  ],
};

function Prompts() {
  const session = useSession();
  return (
    <ul
      aria-label="Prompts"
      onClick={() => void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'Hi'}})}
    >
      {session.turns.map((turn) => (
        <li key={turn.id}>{turn.input.prompt}</li>
      ))}
    </ul>
  );
}

function Draft() {
  const [draft, setDraft] = useState('');
  return (
    <input aria-label="Draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
  );
}

const reopenedConversation: SerializedSession = {
  version: 2,
  sessionId: 'session-2',
  turns: [
    {
      id: 'turn-9',
      input: {prompt: 'What did I ask last week?'},
      status: 'complete',
      response: {activities: []},
    },
  ],
};

function NewConversation() {
  const {startNew, open, readOnly} = useConversations();
  return (
    <>
      <button onClick={startNew}>New conversation</button>
      <button onClick={() => open({sessionToRestore: reopenedConversation, readOnly: true})}>
        Reopen
      </button>
      {readOnly && <p>Read-only</p>}
    </>
  );
}

function renderProvider() {
  return render(
    <SessionProvider>
      <Prompts />
      <Draft />
      <NewConversation />
    </SessionProvider>
  );
}

/** Renders the provider afresh, as a page reload does, with what the tab kept. */
function reload() {
  cleanup();
  renderProvider();
}

describe('SessionProvider', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('restores the conversation kept for this tab', () => {
    keepCurrentConversation({session: keptConversation, readOnly: false});

    renderProvider();

    expect(screen.getByRole('listitem').textContent).toBe('What is Coveo?');
    expect(screen.queryByText('Read-only')).toBeNull();
  });

  it('keeps the conversation for this tab as it changes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderProvider();

    act(() => screen.getByRole('list', {name: 'Prompts'}).click());
    await waitFor(() => expect(readCurrentConversation()?.session.turns).toHaveLength(1));
    reload();

    expect(screen.getByRole('listitem').textContent).toBe('Hi');
  });

  it('starts a new conversation when the kept one cannot be restored', () => {
    keepCurrentConversation({session: {...keptConversation, version: 999}, readOnly: false});

    renderProvider();

    expect(screen.queryAllByRole('listitem')).toEqual([]);
    expect(readCurrentConversation()).toBeUndefined();
  });

  it('starts a new conversation on request, forgetting the current one', () => {
    keepCurrentConversation({session: keptConversation, readOnly: false});
    renderProvider();
    fireEvent.change(screen.getByLabelText('Draft'), {target: {value: 'unsent'}});

    fireEvent.click(screen.getByRole('button', {name: 'New conversation'}));

    expect(screen.queryAllByRole('listitem')).toEqual([]);
    expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe('');
    reload();
    expect(screen.queryAllByRole('listitem')).toEqual([]);
  });

  it('does not bring back a conversation left mid-answer for a new one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) =>
            init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
          )
      )
    );
    renderProvider();
    act(() => screen.getByRole('list', {name: 'Prompts'}).click());
    await waitFor(() => expect(readCurrentConversation()?.session.turns).toHaveLength(1));

    fireEvent.click(screen.getByRole('button', {name: 'New conversation'}));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    reload();

    expect(screen.queryAllByRole('listitem')).toEqual([]);
  });

  it('reopens a conversation read-only', () => {
    keepCurrentConversation({session: keptConversation, readOnly: false});
    renderProvider();

    fireEvent.click(screen.getByRole('button', {name: 'Reopen'}));

    expect(screen.getByRole('listitem').textContent).toBe('What did I ask last week?');
    expect(screen.getByText('Read-only')).toBeDefined();
  });

  it('brings a reopened conversation back on reload, still read-only', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', {name: 'Reopen'}));

    reload();

    expect(screen.getByRole('listitem').textContent).toBe('What did I ask last week?');
    expect(screen.getByText('Read-only')).toBeDefined();
  });

  it('leaves a reopened conversation for a new one that can be continued', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', {name: 'Reopen'}));

    fireEvent.click(screen.getByRole('button', {name: 'New conversation'}));

    expect(screen.queryAllByRole('listitem')).toEqual([]);
    expect(screen.queryByText('Read-only')).toBeNull();
  });
});
