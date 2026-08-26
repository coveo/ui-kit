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

  it('renders SearchResultsPage after a turn completes with a commerce-search activity', () => {
    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          agentResponse: {
            messages: [],
            surfaces: [],
            activities: [makeCommerceSearchActivity('wetsuits-surface')],
            state: {},
            reasoningSteps: [],
          },
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('surface-id').textContent).toBe('wetsuits-surface');
  });

  it('renders ConversationPage after submitting and a turn completes with agentResponse', () => {
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          agentResponse: {
            messages: [{content: 'Hello!', role: 'assistant'}],
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

  it('"Back to search results" navigates from conversation to search view', () => {
    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          agentResponse: {
            messages: [],
            surfaces: [],
            activities: [makeCommerceSearchActivity()],
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

    act(() => {
      screen.getByTestId('search-submit-btn').click();
    });

    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          agentResponse: {
            messages: [],
            surfaces: [],
            activities: [makeCommerceSearchActivity()],
            state: {},
            reasoningSteps: [],
          },
        }),
        makeTurn({
          id: 'turn-2',
          agentResponse: {
            messages: [{content: 'More info', role: 'assistant'}],
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

    act(() => {
      screen.getByTestId('back-btn').click();
    });

    expect(screen.getByTestId('search-results-page')).toBeDefined();
  });

  it('"Back to search results" is disabled when no commerce surface exists', () => {
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);

    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-1',
          agentResponse: {
            messages: [{content: 'Hello!', role: 'assistant'}],
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

    const backBtn = screen.getByTestId('back-btn');
    expect(backBtn.getAttribute('disabled')).not.toBeNull();
  });
});
