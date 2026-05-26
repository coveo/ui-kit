import {fireEvent, render, waitFor} from '@testing-library/react';
import {beforeEach, expect, test, vi} from 'vitest';
import App from './App.js';

type MockConversationState = {
  messages: Array<{id: string; role: 'user' | 'agent'; content: string}>;
  turns: Array<{
    id: string;
    status: {type: string; reason?: string};
  }>;
  activeTurnId: string | null;
  session: {
    conversationSessionId?: string;
    conversationToken?: string;
  };
  isLoading: boolean;
  error: string | null;
  streaming: {isConnected: boolean};
};

let mockState: MockConversationState;
const subscriptions = new Set<() => void>();

function emitState() {
  subscriptions.forEach((callback) => callback());
}

const mockSubmitTurn = vi.fn();
const mockAbortTurn = vi.fn();

vi.mock('./conversation-controller.js', () => ({
  getConversationController: () => ({
    submitTurn: mockSubmitTurn,
    abortTurn: mockAbortTurn,
    subscribe: (callback: () => void) => {
      subscriptions.add(callback);
      return () => subscriptions.delete(callback);
    },
    get state() {
      return mockState;
    },
  }),
}));

beforeEach(() => {
  subscriptions.clear();
  window.history.replaceState({}, '', '/');

  mockState = {
    messages: [],
    turns: [],
    activeTurnId: null,
    session: {},
    isLoading: false,
    error: null,
    streaming: {isConnected: false},
  };

  mockSubmitTurn.mockReset();
  mockAbortTurn.mockReset();

  mockSubmitTurn.mockImplementation(async (input: string) => {
    mockState = {
      ...mockState,
      messages: [
        {
          id: 'user-1',
          role: 'user',
          content: input,
        },
      ],
      turns: [{id: 'turn-1', status: {type: 'pending'}}],
      activeTurnId: 'turn-1',
      isLoading: true,
      streaming: {isConnected: true},
    };
    emitState();
  });

  mockAbortTurn.mockImplementation(() => {
    mockState = {
      ...mockState,
      activeTurnId: null,
      isLoading: false,
      streaming: {isConnected: false},
      turns: [
        {id: 'turn-1', status: {type: 'aborted', reason: 'user_aborted'}},
      ],
    };
    emitState();
  });
});

beforeEach(() => {
  vi.stubEnv('VITE_COVEO_ORGANIZATION_ID', 'my-org');
  vi.stubEnv('VITE_COVEO_ACCESS_TOKEN', 'my-token');
  vi.stubEnv('VITE_COVEO_TRACKING_ID', 'sample-tracking-id');
  vi.stubEnv('VITE_COVEO_LANGUAGE', 'en');
  vi.stubEnv('VITE_COVEO_COUNTRY', 'US');
  vi.stubEnv('VITE_COVEO_CURRENCY', 'USD');
});

test('renders initialized sample metadata', () => {
  const {getByText} = render(<App />);

  expect(getByText('Headless Future Conversation Sample')).toBeTruthy();
  expect(getByText('organizationId: my-org')).toBeTruthy();
  expect(getByText('Press Enter to submit a message.')).toBeTruthy();
});

test('submits a prompt when pressing Enter', async () => {
  const {getByLabelText} = render(<App />);
  const input = getByLabelText('Message input');
  const form = input.closest('form');

  if (!form) {
    throw new Error('Composer form not found in test');
  }

  fireEvent.change(input, {target: {value: 'hello from unit test'}});
  fireEvent.submit(form);

  await waitFor(() => {
    expect(mockSubmitTurn).toHaveBeenCalledWith('hello from unit test');
  });
});

test('injects continuity params from URL on the first submit', async () => {
  window.history.replaceState(
    {},
    '',
    '/?conversationSessionId=session-123&conversationToken=token-123'
  );

  const {getByLabelText} = render(<App />);
  const input = getByLabelText('Message input');
  const form = input.closest('form');

  if (!form) {
    throw new Error('Composer form not found in test');
  }

  fireEvent.change(input, {target: {value: 'hello from unit test'}});
  fireEvent.submit(form);

  await waitFor(() => {
    expect(mockSubmitTurn).toHaveBeenCalledWith('hello from unit test', {
      conversationSessionId: 'session-123',
      conversationToken: 'token-123',
    });
  });
});

test('shows stop button only while a turn is active and aborts on click', async () => {
  const {getByLabelText, queryByRole, getByRole} = render(<App />);
  const input = getByLabelText('Message input');
  const form = input.closest('form');

  if (!form) {
    throw new Error('Composer form not found in test');
  }

  expect(queryByRole('button', {name: 'Stop response'})).toBeNull();

  fireEvent.change(input, {target: {value: 'hello'}});
  fireEvent.submit(form);

  const stopButton = await waitFor(() =>
    getByRole('button', {name: 'Stop response'})
  );

  fireEvent.click(stopButton);

  await waitFor(() => {
    expect(mockAbortTurn).toHaveBeenCalledTimes(1);
    expect(queryByRole('button', {name: 'Stop response'})).toBeNull();
  });
});
