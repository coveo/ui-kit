import {render, screen, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import type {Session, Turn} from '@coveo/thermidor';
import {AppShell} from './AppShell.js';
import {makeTurn, makeSurface} from '../test/turn-fixtures.js';

const mockSubmit = vi.fn();

let mockTurns: Turn[] = [];

// AppShell reads turns through `useSession()`. The fake session exposes the
// members the shell touches: an observable `turns` list and `submit`.
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
      <button data-testid="submit-btn" onClick={() => props.onSubmit('surfboards')} />
    </div>
  ),
}));

vi.mock('./SearchResultsPage/SearchResultsPage.js', () => ({
  SearchResultsPage: (props: any) => (
    <div data-testid="search-results-page">
      <span data-testid="surface-id">{props.surfaceId}</span>
      <button data-testid="search-submit-btn" onClick={() => props.onSubmit('kayaks')} />
      <button data-testid="back-to-conversation" onClick={props.onBackToConversation} />
    </div>
  ),
}));

vi.mock('./ConversationPage/index.js', () => ({
  ConversationPage: (props: any) => (
    <div data-testid="conversation-page">
      <button data-testid="back-to-search" onClick={props.onBackToSearch} />
      <button
        data-testid="conversation-submit"
        onClick={() => props.onSubmit('follow up question')}
      />
    </div>
  ),
}));

describe('AppShell bidirectional navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTurns = [];
  });

  it('session continuity: same session submit used across all transitions', () => {
    const {rerender} = render(<AppShell />);

    // Landing → submit
    act(() => {
      screen.getByTestId('submit-btn').click();
    });
    expect(mockSubmit).toHaveBeenCalledWith({prompt: 'surfboards'});

    // Turn completes with a commerce-search surface → navigate to search
    mockTurns = [
      makeTurn({
        id: 'turn-1',
        prompt: 'surfboards',
        response: {surfaces: [makeSurface('s1', 'commerce-search')]},
      }),
    ];
    rerender(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // Submit from search → same session submit
    mockSubmit.mockClear();
    act(() => {
      screen.getByTestId('search-submit-btn').click();
    });
    expect(mockSubmit).toHaveBeenCalledWith({prompt: 'kayaks'});
  });

  it('"Back to conversation" navigates from search to conversation without submitting', () => {
    // Turn with commerce-search surface → search view
    mockTurns = [
      makeTurn({
        id: 'turn-1',
        prompt: 'surfboards',
        response: {surfaces: [makeSurface('s1', 'commerce-search')]},
      }),
    ];

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // Submit from search → conversation turn arrives
    act(() => {
      screen.getByTestId('search-submit-btn').click();
    });

    mockTurns = [
      makeTurn({
        id: 'turn-1',
        prompt: 'surfboards',
        response: {surfaces: [makeSurface('s1', 'commerce-search')]},
      }),
      makeTurn({
        id: 'turn-2',
        prompt: 'kayaks',
        response: {
          agent: {
            messages: [{content: 'Here are kayaks', role: 'assistant'}],
            reasoningSteps: [{type: 'reasoning', content: 'thinking'}],
          },
        },
      }),
    ];
    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    // Back to search (without new submission)
    act(() => {
      screen.getByTestId('back-to-search').click();
    });
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(mockSubmit).toHaveBeenCalledTimes(1); // only the kayaks submit, no extra
  });

  it('navigates to search when a turn has both a commerce-search surface and reasoning steps (ordering invariant)', () => {
    mockTurns = [];

    const {rerender} = render(<AppShell />);

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    // Turn arrives with BOTH a commerce-search surface AND reasoning steps.
    // Per the ordering invariant: the commerce-search surface takes precedence → search view.
    mockTurns = [
      makeTurn({
        id: 'turn-1',
        prompt: 'surfboards',
        response: {
          surfaces: [makeSurface('s1', 'commerce-search')],
          agent: {
            messages: [],
            reasoningSteps: [{type: 'reasoning', content: 'let me search for surfboards'}],
          },
        },
      }),
    ];
    rerender(<AppShell />);

    expect(screen.getByTestId('search-results-page')).toBeDefined();
  });
});
