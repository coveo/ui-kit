import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {SerializedSession} from '@coveo/thermidor';
import {useState} from 'react';
import {SessionProvider, useConversations, useSession} from './session.js';

const CURRENT_CONVERSATION_KEY = 'demo-current-conversation';

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

const storedConversation: SerializedSession = {
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
      <button onClick={() => open({sessionToRestore: storedConversation, readOnly: true})}>
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

describe('SessionProvider', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('restores the conversation kept for this tab', () => {
    sessionStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(keptConversation));

    renderProvider();

    expect(screen.getByRole('listitem').textContent).toBe('What is Coveo?');
  });

  it('keeps the conversation for this tab as it changes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderProvider();

    act(() => screen.getByRole('list', {name: 'Prompts'}).click());

    await waitFor(() => {
      const kept = JSON.parse(sessionStorage.getItem(CURRENT_CONVERSATION_KEY) ?? 'null');
      expect(kept?.turns.map((turn: {input: {prompt?: string}}) => turn.input.prompt)).toEqual([
        'Hi',
      ]);
    });
  });

  it('starts a new conversation when the kept one cannot be restored', () => {
    sessionStorage.setItem(
      CURRENT_CONVERSATION_KEY,
      JSON.stringify({...keptConversation, version: 999})
    );

    renderProvider();

    expect(screen.queryAllByRole('listitem')).toEqual([]);
    expect(sessionStorage.getItem(CURRENT_CONVERSATION_KEY)).toBeNull();
  });

  it('starts a new conversation on request, forgetting the current one', () => {
    sessionStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(keptConversation));
    renderProvider();
    fireEvent.change(screen.getByLabelText('Draft'), {target: {value: 'unsent'}});

    fireEvent.click(screen.getByRole('button', {name: 'New conversation'}));

    expect(screen.queryAllByRole('listitem')).toEqual([]);
    expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe('');
    expect(sessionStorage.getItem(CURRENT_CONVERSATION_KEY)).toBeNull();
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
    await waitFor(() => expect(sessionStorage.getItem(CURRENT_CONVERSATION_KEY)).not.toBeNull());

    fireEvent.click(screen.getByRole('button', {name: 'New conversation'}));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(sessionStorage.getItem(CURRENT_CONVERSATION_KEY)).toBeNull();
  });

  it('reopens a conversation read-only, keeping the current one for this tab', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    sessionStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(keptConversation));
    renderProvider();

    fireEvent.click(screen.getByRole('button', {name: 'Reopen'}));
    act(() => screen.getByRole('list', {name: 'Prompts'}).click());
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(screen.getAllByRole('listitem')[0]?.textContent).toBe('What did I ask last week?');
    expect(screen.getByText('Read-only')).toBeDefined();
    expect(JSON.parse(sessionStorage.getItem(CURRENT_CONVERSATION_KEY) ?? 'null')).toEqual(
      keptConversation
    );
  });

  it('leaves a reopened conversation for a new one that can be continued', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', {name: 'Reopen'}));

    fireEvent.click(screen.getByRole('button', {name: 'New conversation'}));

    expect(screen.queryAllByRole('listitem')).toEqual([]);
    expect(screen.queryByText('Read-only')).toBeNull();
  });
});
