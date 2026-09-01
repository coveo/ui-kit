import {render, screen, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import type {UnifiedConverseControllerState, Turn} from '@coveo/thermidor';
import {AppShell} from './AppShell.js';

const mockSubmit = vi.fn();
const mockClear = vi.fn();

let mockConverseState: UnifiedConverseControllerState;

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

function makeCommerceSearchActivity(surfaceId = 'commerce-surface-1') {
  return {
    id: `activity-${surfaceId}`,
    kind: 'a2ui-surface',
    replace: true,
    payload: {
      messages: [{createSurface: {surfaceType: 'commerceSearch', surfaceId}}],
    },
  };
}

function makeTurn(overrides: Partial<Turn> & {id: string}): Turn {
  return {
    prompt: 'test prompt',
    status: 'complete',
    ...overrides,
  } as Turn;
}

describe('AppShell bidirectional navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };
  });

  it('controller session continuity: same controller instance used across all transitions', () => {
    const {rerender} = render(<AppShell />);

    // Landing → submit
    act(() => {
      screen.getByTestId('submit-btn').click();
    });
    expect(mockSubmit).toHaveBeenCalledWith({prompt: 'surfboards'});

    // Turn completes with commerce search → navigate to search
    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          prompt: 'surfboards',
          agentResponse: {
            messages: [],
            surfaces: [],
            activities: [makeCommerceSearchActivity('s1')],
            state: {},
            reasoningSteps: [],
          },
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // Submit from search → same controller
    mockSubmit.mockClear();
    act(() => {
      screen.getByTestId('search-submit-btn').click();
    });
    expect(mockSubmit).toHaveBeenCalledWith({prompt: 'kayaks'});
  });

  it('"Back to conversation" navigates from search to conversation without submitting', () => {
    // Turn with commerce search → search view
    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          prompt: 'surfboards',
          agentResponse: {
            messages: [],
            surfaces: [],
            activities: [makeCommerceSearchActivity('s1')],
            state: {},
            reasoningSteps: [],
          },
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // Submit from search → conversation turn arrives
    act(() => {
      screen.getByTestId('search-submit-btn').click();
    });

    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          prompt: 'surfboards',
          agentResponse: {
            messages: [],
            surfaces: [],
            activities: [makeCommerceSearchActivity('s1')],
            state: {},
            reasoningSteps: [],
          },
        }),
        makeTurn({
          id: 'turn-2',
          prompt: 'kayaks',
          agentResponse: {
            messages: [{content: 'Here are kayaks', role: 'assistant'}],
            surfaces: [],
            activities: [],
            state: {},
            reasoningSteps: [{type: 'reasoning', content: 'thinking'}],
          },
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    // Back to search (without new submission)
    act(() => {
      screen.getByTestId('back-to-search').click();
    });
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(mockSubmit).toHaveBeenCalledTimes(1); // only the kayaks submit, no extra
  });

  it('navigates to search when a turn has both commerce-search activity and reasoning steps (ordering invariant)', () => {
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    // Turn arrives with BOTH a commerce-search activity AND reasoning steps.
    // Per the ordering invariant: commerce-search activity takes precedence → search view.
    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          prompt: 'surfboards',
          agentResponse: {
            messages: [],
            surfaces: [],
            activities: [makeCommerceSearchActivity('s1')],
            state: {},
            reasoningSteps: [{type: 'reasoning', content: 'let me search for surfboards'}],
          },
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    expect(screen.getByTestId('search-results-page')).toBeDefined();
  });
});
