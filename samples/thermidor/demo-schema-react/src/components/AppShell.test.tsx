import {render, screen, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import type {Session, Turn} from '@coveo/thermidor';
import {AppShell} from './AppShell.js';
import {makeTurn, makeSurface} from '../test/turn-fixtures.js';

const mockSubmit = vi.fn();

let mockTurns: Turn[] = [];

// AppShell reads turns through `useSession()` and drives navigation off the
// `response.surfaces` projection. The fake session exposes just the members the
// shell touches: `turns`, `subscribe`, and `submit`.
vi.mock('../context/session.js', () => ({
  useSession: () =>
    ({
      get turns() {
        return mockTurns;
      },
      subscribe: () => () => undefined,
      submit: mockSubmit,
    }) as unknown as Session<never>,
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
      <span data-testid="surface-id">{props.surfaceId}</span>
      <button data-testid="search-submit-btn" onClick={() => props.onSubmit('follow up')} />
    </div>
  ),
}));

vi.mock('./ConversationPage/index.js', () => ({
  ConversationPage: (props: any) => (
    <div data-testid="conversation-page">
      <button
        data-testid="back-btn"
        onClick={props.onBackToSearch}
        disabled={!props.canGoBackToSearch}
      />
    </div>
  ),
}));

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTurns = [];
  });

  it('renders LandingPage initially', () => {
    render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();
  });

  it('renders SearchResultsPage after a turn completes with a commerce-search surface', () => {
    mockTurns = [
      makeTurn({
        id: 'turn-1',
        response: {surfaces: [makeSurface('wetsuits-surface', 'commerce-search')]},
      }),
    ];

    render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('surface-id').textContent).toBe('wetsuits-surface');
  });

  it('renders ConversationPage after submitting and a turn completes with an agent response', () => {
    mockTurns = [];

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    mockTurns = [
      makeTurn({
        id: 'turn-1',
        response: {
          agent: {
            messages: [{content: 'Hello!', role: 'assistant'}],
            reasoningSteps: [{type: 'reasoning', content: 'thinking'}],
          },
        },
      }),
    ];

    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();
  });

  it('does not change view on error turn', () => {
    mockTurns = [makeTurn({id: 'turn-1', status: 'error', error: 'Something'})];

    render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();
  });

  it('prevents submission while streaming', () => {
    mockTurns = [makeTurn({id: 'turn-1', status: 'streaming'})];

    render(<AppShell />);

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('"Back to search results" navigates from conversation to search view', () => {
    mockTurns = [
      makeTurn({
        id: 'turn-1',
        response: {surfaces: [makeSurface('commerce-surface-1', 'commerce-search')]},
      }),
    ];

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    act(() => {
      screen.getByTestId('search-submit-btn').click();
    });

    mockTurns = [
      makeTurn({
        id: 'turn-1',
        response: {surfaces: [makeSurface('commerce-surface-1', 'commerce-search')]},
      }),
      makeTurn({
        id: 'turn-2',
        response: {
          agent: {
            messages: [{content: 'More info', role: 'assistant'}],
            reasoningSteps: [{type: 'reasoning', content: 'thinking'}],
          },
        },
      }),
    ];

    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    act(() => {
      screen.getByTestId('back-btn').click();
    });

    expect(screen.getByTestId('search-results-page')).toBeDefined();
  });

  it('"Back to search results" is disabled when no commerce surface exists', () => {
    mockTurns = [];

    const {rerender} = render(<AppShell />);

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    mockTurns = [
      makeTurn({
        id: 'turn-1',
        response: {
          agent: {
            messages: [{content: 'Hello!', role: 'assistant'}],
            reasoningSteps: [{type: 'reasoning', content: 'thinking'}],
          },
        },
      }),
    ];

    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    const backBtn = screen.getByTestId('back-btn');
    expect(backBtn.getAttribute('disabled')).not.toBeNull();
  });
});
