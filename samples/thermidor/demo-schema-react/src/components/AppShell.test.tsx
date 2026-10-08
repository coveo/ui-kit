import {render, screen, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import type {Session, Turn} from '@coveo/thermidor';
import {AppShell} from './AppShell.js';
import {makeTurn} from '../test/turn-fixtures.js';

const mockDispatchAction = vi.fn();

let mockTurns: Turn[] = [];
let capturedOnAction: ((message: unknown) => unknown) | undefined;

// `actions` is a real coordinator sending to `mockDispatchAction`, so renderer actions hit the spy.
vi.mock('../context/session.js', async () => {
  const {createDispatchCoordinator} = await import('@coveo/thermidor');
  const actions = createDispatchCoordinator((message: unknown) => mockDispatchAction(message));
  return {
    useSession: () =>
      ({
        get turns() {
          return mockTurns;
        },
        subscribe: () => () => undefined,
        dispatchAction: mockDispatchAction,
        actions,
      }) as unknown as Session,
  };
});

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
  ThermidorA2UIStream: () => null,
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
      <span data-testid="turn-surfaces">
        {props.turns.map((turn: Turn) => props.surfacesByTurn.get(turn.id).join(',')).join('|')}
      </span>
      <span data-testid="follow-ups">
        {props.turns
          .map((turn: Turn) =>
            (props.followUps.get(turn.id) ?? [])
              .map((followUp: {prompt?: string}) => followUp.prompt ?? '(option)')
              .join(',')
          )
          .join('|')}
      </span>
      <span data-testid="pending-turn">{props.pendingTurnId ?? ''}</span>
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
      a2uiMessages: [{version: 'v0.9', createSurface: {surfaceId: SEARCH_SURFACE_ID}}],
    },
  });
}

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByTestId('turn-surfaces').textContent).toBe(`turn-1/${SEARCH_SURFACE_ID}|`);
  });

  it('withholds a prompt while a turn is streaming', () => {
    mockTurns = [makeTurn({id: 'turn-1', status: 'streaming'})];

    render(<AppShell />);
    act(() => {
      screen.getByTestId('conversation-submit').click();
    });

    expect(mockDispatchAction).not.toHaveBeenCalled();
  });

  it('sends a renderer action with the server surface id', () => {
    mockTurns = [searchTurn('turn-1')];

    render(<AppShell />);
    act(() => {
      capturedOnAction?.({
        version: 'v0.9',
        userAction: {
          name: 'toggleSelect',
          surfaceId: `turn-1/${SEARCH_SURFACE_ID}`,
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

  describe('follow-up actions', () => {
    function agentTurn(id: string): Turn {
      return makeTurn({
        id,
        response: {
          agent: {messages: [{content: 'Answer', role: 'assistant'}], reasoningSteps: []},
          a2uiMessages: [{version: 'v0.9', createSurface: {surfaceId: 'agent-answer'}}],
        },
      });
    }

    function followUpAction(name: string, context: Record<string, unknown>) {
      return {
        version: 'v0.9',
        userAction: {name, surfaceId: 'turn-1/agent-answer', sourceComponentId: 'root', context},
      };
    }

    it('shows a selected follow-up as its own exchange, streaming until its run ends', async () => {
      mockTurns = [agentTurn('turn-1')];
      let finishRun: () => void = () => undefined;
      mockDispatchAction.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          finishRun = resolve;
        })
      );

      render(<AppShell />);
      act(() => {
        void capturedOnAction?.(
          followUpAction('selectAction', {text: 'Show more life jackets', type: 'followup'})
        );
      });

      expect(screen.getByTestId('follow-ups').textContent).toBe('Show more life jackets');
      expect(screen.getByTestId('pending-turn').textContent).toBe('turn-1');
      expect(screen.getByTestId('streaming').textContent).toBe('true');

      await act(async () => {
        finishRun();
      });

      expect(screen.getByTestId('pending-turn').textContent).toBe('');
      expect(screen.getByTestId('streaming').textContent).toBe('false');
      expect(screen.getByTestId('follow-ups').textContent).toBe('Show more life jackets');
    });

    it('ignores actions while a follow-up is in flight', async () => {
      mockTurns = [agentTurn('turn-1')];
      let finishRun: () => void = () => undefined;
      mockDispatchAction.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          finishRun = resolve;
        })
      );

      render(<AppShell />);
      act(() => {
        void capturedOnAction?.(
          followUpAction('selectAction', {text: 'Show more life jackets', type: 'followup'})
        );
      });
      act(() => {
        void capturedOnAction?.(followUpAction('selectSearchOption', {optionId: 'opt-1'}));
        void capturedOnAction?.(followUpAction('selectPage', {page: 1}));
      });

      expect(mockDispatchAction).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('follow-ups').textContent).toBe('Show more life jackets');

      await act(async () => {
        finishRun();
      });
    });

    it('records a search option without a prompt', async () => {
      mockTurns = [agentTurn('turn-1')];
      mockDispatchAction.mockResolvedValueOnce(undefined);

      render(<AppShell />);
      await act(async () => {
        await capturedOnAction?.(followUpAction('selectSearchOption', {optionId: 'opt-1'}));
      });

      expect(screen.getByTestId('follow-ups').textContent).toBe('(option)');
    });

    it('does not record an action that updates a block', async () => {
      mockTurns = [agentTurn('turn-1')];
      mockDispatchAction.mockResolvedValueOnce(undefined);

      render(<AppShell />);
      await act(async () => {
        await capturedOnAction?.(followUpAction('selectPage', {page: 1}));
      });

      expect(screen.getByTestId('follow-ups').textContent).toBe('');
      expect(mockDispatchAction).toHaveBeenCalledWith(
        expect.objectContaining({userAction: expect.objectContaining({surfaceId: 'agent-answer'})})
      );
    });
  });
});
