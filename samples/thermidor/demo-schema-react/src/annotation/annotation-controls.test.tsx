import {render, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {SerializedSession} from '@coveo/thermidor';
import {AnnotationControl, KeptConversations} from './annotation-controls.js';
import {mount, mountConversations} from '../test/fake-annotation-module.js';

const MODULE_URL = '/src/test/fake-annotation-module.ts';

const serialized: SerializedSession = {
  version: 2,
  sessionId: 'session-1',
  sessionToken: 'secret-token',
  turns: [
    {
      id: 'turn-1',
      input: {prompt: 'What is Coveo?'},
      status: 'complete',
      response: {activities: []},
    },
  ],
};
const mockOpen = vi.fn();

vi.mock('../context/session.js', () => ({
  useSession: () => ({serialize: () => serialized}),
  useConversations: () => ({open: mockOpen}),
}));

const turnRef = {conversation_id: 'conversation-1', turn_id: 'turn-1', request_id: 'request-1'};

describe('AnnotationControl', () => {
  beforeEach(() => vi.clearAllMocks());

  it("mounts the layer's control for the turn, with the conversation's snapshot", async () => {
    render(<AnnotationControl moduleUrl={MODULE_URL} turnRef={turnRef} />);
    await waitFor(() => expect(mount).toHaveBeenCalledOnce());

    const [element, mountedTurnRef, {snapshot}] = mount.mock.calls[0]!;
    expect(element).toBeInstanceOf(HTMLElement);
    expect(mountedTurnRef).toEqual(turnRef);
    expect(snapshot()).toEqual({
      format: 'thermidor-session',
      version: 2,
      conversation_id: 'conversation-1',
      title: 'What is Coveo?',
      content: {version: 2, sessionId: 'session-1', turns: serialized.turns},
    });
  });
});

describe('KeptConversations', () => {
  beforeEach(() => vi.clearAllMocks());

  async function openOf() {
    render(<KeptConversations moduleUrl={MODULE_URL} />);
    await waitFor(() => expect(mountConversations).toHaveBeenCalledOnce());
    return mountConversations.mock.calls[0]![1].open as (snapshot: unknown) => void;
  }

  it('opens a conversation kept read-only', async () => {
    const open = await openOf();

    open({format: 'thermidor-session', version: 2, conversation_id: 'c', content: serialized});

    expect(mockOpen).toHaveBeenCalledExactlyOnceWith({
      sessionToRestore: serialized,
      readOnly: true,
    });
  });

  it('refuses a conversation kept of another format', async () => {
    const open = await openOf();

    expect(() =>
      open({format: 'other-chat', version: 1, conversation_id: 'c', content: {}})
    ).toThrow('is not a Thermidor session');
    expect(mockOpen).not.toHaveBeenCalled();
  });
});
