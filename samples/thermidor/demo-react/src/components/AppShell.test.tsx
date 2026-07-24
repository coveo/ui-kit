import {render, screen, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import type {ConverseControllerState, Turn} from '@coveo/thermidor';
import {AppShell} from './AppShell.js';

const mockSubmit = vi.fn();
const mockClear = vi.fn();

let mockConverseState: ConverseControllerState;

vi.mock('../context/generative-interface.js', () => ({
  useGenerativeInterface: () => ({}),
}));

vi.mock('../hooks/use-build-controller.js', () => ({
  useBuildController: () => [
    {submit: mockSubmit, clear: mockClear, subscribe: vi.fn(), state: {}},
    mockConverseState,
  ],
}));

vi.mock('./LandingPage/LandingPage.js', () => ({
  LandingPage: (props: any) => (
    <div data-testid="landing-page">
      <button data-testid="submit-btn" onClick={() => props.onSubmit('hello')} />
      <span data-testid="streaming">{String(props.isStreaming)}</span>
    </div>
  ),
}));

vi.mock('./SearchResultsPage/SearchResultsPage.js', () => ({
  SearchResultsPage: (props: any) => (
    <div data-testid="search-results-page">
      <span data-testid="use-case">{props.routedInterface?.useCase}</span>
    </div>
  ),
}));

vi.mock('./ConversationPage.js', () => ({
  ConversationPage: (props: any) => (
    <div data-testid="conversation-page">
      <button
        data-testid="back-btn"
        onClick={props.onBackToSearch}
        disabled={!props.canGoBackToSearch}
      />
      <button data-testid="reset-btn" onClick={props.onResetToLanding} />
    </div>
  ),
}));

function makeTurn(overrides: Partial<Turn> & {id: string}): Turn {
  return {
    prompt: 'test prompt',
    status: 'complete',
    ...overrides,
  } as Turn;
}

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };
  });

  it('renders LandingPage initially', () => {
    render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();
  });

  it('renders SearchResultsPage after a turn completes with routedInterface', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', routedInterface: routedInterface as any})],
      activeTurn: undefined,
      isStreaming: false,
    };

    render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('use-case').textContent).toBe('search');
  });

  it('renders ConversationPage after a turn completes with agentResponse', () => {
    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          agentResponse: {text: 'Hello!'} as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    render(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();
  });

  it('does not change view on error turn', () => {
    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', status: 'error', error: 'Something'})],
      activeTurn: undefined,
      isStreaming: false,
    };

    render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();
  });

  it('prevents submission while streaming', () => {
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: true,
    };

    render(<AppShell />);

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('disposes the first routedInterface when a second one arrives', () => {
    const mockDispose1 = vi.fn();
    const routedInterface1 = {
      useCase: 'search' as const,
      interface: {dispose: mockDispose1},
    };

    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', routedInterface: routedInterface1 as any})],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(mockDispose1).not.toHaveBeenCalled();

    const mockDispose2 = vi.fn();
    const routedInterface2 = {
      useCase: 'search' as const,
      interface: {dispose: mockDispose2},
    };

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', routedInterface: routedInterface1 as any}),
        makeTurn({id: 'turn-2', routedInterface: routedInterface2 as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    rerender(<AppShell />);

    expect(mockDispose1).toHaveBeenCalledTimes(1);
    expect(mockDispose2).not.toHaveBeenCalled();
  });

  it('"Back to search results" navigates from conversation to search view', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', routedInterface: routedInterface as any})],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', routedInterface: routedInterface as any}),
        makeTurn({id: 'turn-2', agentResponse: {text: 'Hello!'} as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    act(() => {
      screen.getByTestId('back-btn').click();
    });

    expect(screen.getByTestId('search-results-page')).toBeDefined();
  });

  it('"Back to search results" is disabled when no persisted interface exists', () => {
    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', agentResponse: {text: 'Hello!'} as any})],
      activeTurn: undefined,
      isStreaming: false,
    };

    render(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    const backBtn = screen.getByTestId('back-btn');
    expect(backBtn.getAttribute('disabled')).not.toBeNull();
  });

  it('"Reset to landing" disposes interface, clears controller, and transitions to landing', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', routedInterface: routedInterface as any})],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', routedInterface: routedInterface as any}),
        makeTurn({id: 'turn-2', agentResponse: {text: 'Hello!'} as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    act(() => {
      screen.getByTestId('reset-btn').click();
    });

    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('landing-page')).toBeDefined();
  });

  it('after reset, persisted interface ref is null (back button disabled on next conversation)', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', routedInterface: routedInterface as any})],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', routedInterface: routedInterface as any}),
        makeTurn({id: 'turn-2', agentResponse: {text: 'Hello!'} as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    act(() => {
      screen.getByTestId('reset-btn').click();
    });

    expect(screen.getByTestId('landing-page')).toBeDefined();

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', routedInterface: routedInterface as any}),
        makeTurn({id: 'turn-2', agentResponse: {text: 'Hello!'} as any}),
        makeTurn({id: 'turn-3', agentResponse: {text: 'World!'} as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    const backBtn = screen.getByTestId('back-btn');
    expect(backBtn.getAttribute('disabled')).not.toBeNull();
  });
});
