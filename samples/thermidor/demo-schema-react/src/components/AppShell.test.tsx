import {render, screen, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import type {Session, Turn} from '@coveo/thermidor';
import {AppShell} from './AppShell.js';
import {makeSurfaces, makeTurn} from '../test/turn-fixtures.js';

const mockDispatchAction = vi.fn();

let mockTurns: Turn[] = [];
let capturedOnAction: ((message: unknown) => unknown) | undefined;

// The session's request chain is faked, so every dispatch reaches the spy one at a time.
let mockSession: Session;
vi.mock('../context/session.js', () => ({useSession: () => mockSession}));

async function createMockSession(): Promise<Session> {
  const {createFakeSessionRequests} = await import('../test/fake-session-requests.js');
  // Every action of these tests comes from the brand facet.
  const requests = createFakeSessionRequests(
    (message: never) => mockDispatchAction(message),
    () => 'RegularFacet'
  );
  let snapshotSource: [Turn[], unknown] | undefined;
  let snapshot: unknown;
  return {
    getSnapshot() {
      const requestState = requests.source.getSnapshot();
      if (snapshotSource?.[0] !== mockTurns || snapshotSource[1] !== requestState) {
        snapshotSource = [mockTurns, requestState];
        snapshot = {
          ...requestState,
          turns: mockTurns,
          surfaces: [],
          a2uiMessages: [],
          state: {},
        };
      }
      return snapshot;
    },
    subscribe: requests.source.subscribe,
    sendAndWait: requests.source.sendAndWait,
    dispatchAction: requests.dispatch,
  } as unknown as Session;
}

vi.mock('@copilotkit/a2ui-renderer', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@copilotkit/a2ui-renderer')>()),
  A2UIProvider: ({
    onAction,
    children,
  }: {
    onAction: (message: unknown) => unknown;
    children: React.ReactNode;
  }) => {
    capturedOnAction = onAction;
    return <>{children}</>;
  },
}));

vi.mock('../a2ui/surfaces.js', () => ({
  ThermidorA2UIStream: ({children}: {children?: React.ReactNode}) => <>{children}</>,
}));

vi.mock('./LandingPage/LandingPage.js', () => ({
  LandingPage: (props: any) => (
    <div data-testid="landing-page">
      <button data-testid="submit-btn" onClick={() => props.onSubmit('kayaks')} />
    </div>
  ),
}));

vi.mock('./ConversationPage/index.js', () => ({
  ConversationPage: (props: any) => (
    <div data-testid="conversation-page">
      <span data-testid="locked">{String(props.promptDisabled)}</span>
      <span data-testid="turn-surfaces">
        {props.turns
          .map((turn: Turn) => turn.response.surfaces.map((surface) => surface.surfaceId).join(','))
          .join('|')}
      </span>
      <span data-testid="streaming">{String(props.isStreaming)}</span>
      <button data-testid="conversation-submit" onClick={() => props.onSubmit('follow up')} />
    </div>
  ),
}));

const SEARCH_SURFACE_ID = 'ui-6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b';

function searchTurn(id: string): Turn {
  return makeTurn({
    id,
    response: {
      surfaces: makeSurfaces(SEARCH_SURFACE_ID),
    },
  });
}

describe('AppShell', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSession = await createMockSession();
    mockTurns = [];
    capturedOnAction = undefined;
  });

  it('renders the landing page before the first prompt', () => {
    render(<AppShell />);

    expect(screen.getByTestId('landing-page')).toBeDefined();
    expect(screen.queryByTestId('conversation-page')).toBeNull();
  });

  it('submits a prompt from the landing page', () => {
    render(<AppShell />);

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    expect(mockDispatchAction).toHaveBeenCalledWith({
      name: 'submitPrompt',
      payload: {prompt: 'kayaks'},
    });
  });

  it('renders every turn on the same page, search turns included', () => {
    mockTurns = [
      searchTurn('turn-1'),
      makeTurn({
        id: 'turn-2',
        response: {agent: {messages: [{content: 'Answer', role: 'assistant'}], reasoningSteps: []}},
      }),
    ];

    render(<AppShell />);

    expect(screen.queryByTestId('landing-page')).toBeNull();
    expect(screen.getByTestId('turn-surfaces').textContent).toBe(`${SEARCH_SURFACE_ID}|`);
  });

  it('passes a renderer action to the session as it is', () => {
    mockTurns = [searchTurn('turn-1')];

    render(<AppShell />);
    act(() => {
      capturedOnAction?.({
        version: 'v0.9',
        userAction: {
          name: 'toggleSelect',
          surfaceId: SEARCH_SURFACE_ID,
          sourceComponentId: `${SEARCH_SURFACE_ID}-facet-brand`,
          context: {value: 'Nike'},
        },
      });
    });

    expect(mockDispatchAction).toHaveBeenCalledWith({
      version: 'v0.9',
      userAction: {
        name: 'toggleSelect',
        surfaceId: SEARCH_SURFACE_ID,
        sourceComponentId: `${SEARCH_SURFACE_ID}-facet-brand`,
        context: {value: 'Nike'},
      },
    });
  });

  describe('surface lock', () => {
    function rendererAction(name: string, context: Record<string, unknown> = {}) {
      return {
        version: 'v0.9',
        userAction: {
          name,
          surfaceId: SEARCH_SURFACE_ID,
          sourceComponentId: `${SEARCH_SURFACE_ID}-facet-brand`,
          context,
        },
      };
    }

    function deferredDispatch() {
      let settle: () => void = () => undefined;
      mockDispatchAction.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          settle = resolve;
        })
      );
      return () => settle();
    }

    it('locks the surface and the prompt while a gesture is in flight', async () => {
      mockTurns = [searchTurn('turn-1')];
      const settle = deferredDispatch();

      render(<AppShell />);
      expect(screen.getByTestId('locked').textContent).toBe('false');

      act(() => {
        void capturedOnAction?.(rendererAction('toggleSelect', {value: 'Nike'}));
      });
      expect(screen.getByTestId('locked').textContent).toBe('true');

      await act(async () => {
        settle();
      });
      expect(screen.getByTestId('locked').textContent).toBe('false');
    });

    it.each(['search', 'clearSearch', 'showMoreSearchResults'])(
      'keeps the surface usable during a facet %s',
      async (name) => {
        mockTurns = [searchTurn('turn-1')];
        const settle = deferredDispatch();

        render(<AppShell />);
        act(() => {
          void capturedOnAction?.(rendererAction(name, {query: 'ni'}));
        });

        expect(mockDispatchAction).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('locked').textContent).toBe('false');

        await act(async () => {
          settle();
        });
      }
    );

    it('drops a second gesture sent before the lock renders', async () => {
      mockTurns = [searchTurn('turn-1')];
      const settle = deferredDispatch();

      render(<AppShell />);
      act(() => {
        void capturedOnAction?.(rendererAction('toggleSelect', {value: 'Nike'}));
        void capturedOnAction?.(rendererAction('toggleSelect', {value: 'Adidas'}));
      });

      expect(mockDispatchAction).toHaveBeenCalledTimes(1);

      await act(async () => {
        settle();
      });
      expect(mockDispatchAction).toHaveBeenCalledTimes(1);
    });

    it('drops a gesture sent while a facet search is in flight', async () => {
      mockTurns = [searchTurn('turn-1')];
      const settle = deferredDispatch();

      render(<AppShell />);
      act(() => {
        void capturedOnAction?.(rendererAction('search', {query: 'ni'}));
        void capturedOnAction?.(rendererAction('toggleSelect', {value: 'Nike'}));
      });
      expect(mockDispatchAction).toHaveBeenCalledTimes(1);

      await act(async () => {
        settle();
      });

      expect(mockDispatchAction).toHaveBeenCalledTimes(1);
    });

    it('drops a follow-up while a facet search is in flight', async () => {
      mockTurns = [searchTurn('turn-1')];
      const settle = deferredDispatch();

      render(<AppShell />);
      act(() => {
        void capturedOnAction?.(rendererAction('search', {query: 'ni'}));
        void capturedOnAction?.(rendererAction('selectAction', {text: 'More', type: 'followup'}));
      });

      expect(mockDispatchAction).toHaveBeenCalledTimes(1);

      await act(async () => {
        settle();
      });
      expect(mockDispatchAction).toHaveBeenCalledTimes(1);
    });

    it('withholds a prompt while a request is in flight', async () => {
      mockTurns = [searchTurn('turn-1')];
      const settle = deferredDispatch();

      render(<AppShell />);
      act(() => {
        void capturedOnAction?.(rendererAction('selectPage', {page: 2}));
      });
      act(() => {
        screen.getByTestId('conversation-submit').click();
      });

      expect(mockDispatchAction).toHaveBeenCalledTimes(1);

      await act(async () => {
        settle();
      });
    });

    it('unlocks the surface when an action fails', async () => {
      mockTurns = [searchTurn('turn-1')];
      mockDispatchAction.mockRejectedValueOnce(new Error('network'));

      render(<AppShell />);
      await act(async () => {
        await capturedOnAction?.(rendererAction('selectPage', {page: 2}));
      });

      expect(screen.getByTestId('locked').textContent).toBe('false');
    });
  });

  describe('streaming', () => {
    it('streams while a turn streams, a turn opened by a follow-up included', () => {
      mockTurns = [
        searchTurn('turn-1'),
        {
          ...makeTurn({id: 'turn-2', status: 'streaming'}),
          input: {
            action: {
              component: 'NextActionsBar',
              name: 'selectAction',
              surfaceId: SEARCH_SURFACE_ID,
              sourceComponentId: 'root',
              context: {text: 'Show more', type: 'followup'},
            },
          },
        },
      ];

      render(<AppShell />);

      expect(screen.getByTestId('streaming').textContent).toBe('true');
    });

    it('does not stream once every turn has ended', () => {
      mockTurns = [searchTurn('turn-1')];

      render(<AppShell />);

      expect(screen.getByTestId('streaming').textContent).toBe('false');
    });
  });
});
