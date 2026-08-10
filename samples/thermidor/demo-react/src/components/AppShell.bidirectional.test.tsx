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
      <span data-testid="routed-interface-id">{props.routedInterface?.id}</span>
      <span data-testid="search-query">{props.query}</span>
      <button
        data-testid="search-submit-conversational"
        onClick={() => props.onSubmit('tell me about wetsuits')}
      />
      <button data-testid="search-submit-new-search" onClick={() => props.onSubmit('kayaks')} />
      <button data-testid="back-to-conversation-btn" onClick={props.onBackToConversation} />
    </div>
  ),
}));

vi.mock('./ConversationPage/index.js', () => ({
  ConversationPage: (props: any) => (
    <div data-testid="conversation-page">
      <span data-testid="turn-count">{props.turns.length}</span>
      <span data-testid="turn-ids">{props.turns.map((t: Turn) => t.id).join(',')}</span>
      <span data-testid="can-go-back">{String(props.canGoBackToSearch)}</span>
      <button data-testid="back-btn" onClick={props.onBackToSearch} />
      <button
        data-testid="conversation-submit"
        onClick={() => props.onSubmit('follow up question')}
      />
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

describe('AppShell — bidirectional navigation flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };
  });

  it('full cycle: landing → search → conversation → back to search (state preserved) → new search → conversation', () => {
    const mockDispose1 = vi.fn();
    const routedInterface1 = {
      id: 'ri-1',
      useCase: 'search' as const,
      interface: {dispose: mockDispose1},
    };

    // Step 1: Start at landing
    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();

    // Step 2: Submit a search query from landing
    act(() => {
      screen.getByTestId('submit-btn').click();
    });
    expect(mockSubmit).toHaveBeenCalledWith({prompt: 'surfboards'});

    // Step 3: Turn completes with a routedInterface → navigate to search
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface1 as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('routed-interface-id').textContent).toBe('ri-1');
    expect(screen.getByTestId('search-query').textContent).toBe('surfboards');

    // Step 4: From search, submit a conversational query
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });
    expect(mockSubmit).toHaveBeenCalledWith({prompt: 'tell me about wetsuits'});

    // Step 5: Turn completes with agentResponse → navigate to conversation
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface1 as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Wetsuits are great!', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'Looking up wetsuits'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    expect(screen.getByTestId('conversation-page')).toBeDefined();
    expect(screen.getByTestId('can-go-back').textContent).toBe('true');
    expect(screen.getByTestId('turn-count').textContent).toBe('2');
    expect(screen.getByTestId('turn-ids').textContent).toBe('turn-1,turn-2');

    // Step 6: Navigate back to search results
    act(() => {
      screen.getByTestId('back-btn').click();
    });

    // Search page should render with the SAME persisted interface (not disposed)
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('routed-interface-id').textContent).toBe('ri-1');
    expect(mockDispose1).not.toHaveBeenCalled();
    // Query should be cleared when navigating back via "Back to search results"
    expect(screen.getByTestId('search-query').textContent).toBe('');

    // Step 7: From search, submit a new search query
    act(() => {
      screen.getByTestId('search-submit-new-search').click();
    });
    expect(mockSubmit).toHaveBeenCalledWith({prompt: 'kayaks'});

    // Step 8: New turn completes with a new routedInterface → stays on search, old interface disposed
    const mockDispose2 = vi.fn();
    const routedInterface2 = {
      id: 'ri-2',
      useCase: 'search' as const,
      interface: {dispose: mockDispose2},
    };

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface1 as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Wetsuits are great!', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'Looking up wetsuits'}],
          } as any,
        }),
        makeTurn({id: 'turn-3', prompt: 'kayaks', routedInterface: routedInterface2 as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('routed-interface-id').textContent).toBe('ri-2');
    expect(mockDispose1).toHaveBeenCalledTimes(1);
    expect(mockDispose2).not.toHaveBeenCalled();

    // Step 9: From the new search, submit a conversational query again
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });

    // Step 10: Turn completes with agentResponse → navigate to conversation with full history
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface1 as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Wetsuits are great!', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'Looking up wetsuits'}],
          } as any,
        }),
        makeTurn({id: 'turn-3', prompt: 'kayaks', routedInterface: routedInterface2 as any}),
        makeTurn({
          id: 'turn-4',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'More info on wetsuits', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'Explaining wetsuits in depth'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    expect(screen.getByTestId('conversation-page')).toBeDefined();
    expect(screen.getByTestId('turn-count').textContent).toBe('4');
    expect(screen.getByTestId('turn-ids').textContent).toBe('turn-1,turn-2,turn-3,turn-4');
    expect(screen.getByTestId('can-go-back').textContent).toBe('true');
  });

  it('conversation history is preserved when navigating back from search to conversation via new conversational submission', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      id: 'ri-1',
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    // Start in search mode
    mockConverseState = {
      turns: [makeTurn({id: 'turn-1', prompt: 'shoes', routedInterface: routedInterface as any})],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // Submit conversational query
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });

    // Turn completes → conversation mode
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'shoes', routedInterface: routedInterface as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Info', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'x'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    // Submit a follow-up in conversation
    act(() => {
      screen.getByTestId('conversation-submit').click();
    });

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'shoes', routedInterface: routedInterface as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Info', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'x'}],
          } as any,
        }),
        makeTurn({
          id: 'turn-3',
          prompt: 'follow up question',
          agentResponse: {
            messages: [{content: 'Follow up answer', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'y'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    // All 3 turns present
    expect(screen.getByTestId('turn-count').textContent).toBe('3');

    // Go back to search
    act(() => {
      screen.getByTestId('back-btn').click();
    });
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('routed-interface-id').textContent).toBe('ri-1');
    expect(mockDispose).not.toHaveBeenCalled();

    // Submit another conversational query from search → conversation should have all turns
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });

    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'shoes', routedInterface: routedInterface as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Info', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'x'}],
          } as any,
        }),
        makeTurn({
          id: 'turn-3',
          prompt: 'follow up question',
          agentResponse: {
            messages: [{content: 'Follow up answer', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'y'}],
          } as any,
        }),
        makeTurn({
          id: 'turn-4',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Even more info', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'z'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    // Full history preserved — all 4 turns visible
    expect(screen.getByTestId('conversation-page')).toBeDefined();
    expect(screen.getByTestId('turn-count').textContent).toBe('4');
    expect(screen.getByTestId('turn-ids').textContent).toBe('turn-1,turn-2,turn-3,turn-4');
  });

  it('controller session continuity: same controller instance used across all transitions', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      id: 'ri-1',
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    // Landing → submit
    const {rerender} = render(<AppShell />);
    act(() => {
      screen.getByTestId('submit-btn').click();
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // Arrive at search
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    // Search → submit conversational
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });
    expect(mockSubmit).toHaveBeenCalledTimes(2);

    // Arrive at conversation
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'x', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'r'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    // Conversation → follow up
    act(() => {
      screen.getByTestId('conversation-submit').click();
    });
    expect(mockSubmit).toHaveBeenCalledTimes(3);

    // All calls to the same mockSubmit instance confirms same controller
    expect(mockSubmit).toHaveBeenNthCalledWith(1, {prompt: 'surfboards'});
    expect(mockSubmit).toHaveBeenNthCalledWith(2, {prompt: 'tell me about wetsuits'});
    expect(mockSubmit).toHaveBeenNthCalledWith(3, {prompt: 'follow up question'});
  });

  it('search interface is not disposed on view transitions', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      id: 'ri-1',
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    // Start in search
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // Go to conversation
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'x', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'r'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();
    expect(mockDispose).not.toHaveBeenCalled();

    // Back to search
    act(() => {
      screen.getByTestId('back-btn').click();
    });
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(mockDispose).not.toHaveBeenCalled();

    // Back to conversation again
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'x', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'r'}],
          } as any,
        }),
        makeTurn({
          id: 'turn-3',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'y', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 's'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();
    expect(mockDispose).not.toHaveBeenCalled();
  });

  it('"Back to conversation" button navigates from search to conversation without submitting', () => {
    const mockDispose = vi.fn();
    const routedInterface = {
      id: 'ri-1',
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    // Step 1: Start at landing, get a search result
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();

    // Submit from landing
    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    // Search turn completes
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // Submit conversational query from search
    act(() => {
      screen.getByTestId('search-submit-conversational').click();
    });

    // Conversation turn completes
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
        makeTurn({
          id: 'turn-2',
          prompt: 'tell me about wetsuits',
          agentResponse: {
            messages: [{content: 'Wetsuits info', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'r'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);
    expect(screen.getByTestId('conversation-page')).toBeDefined();

    // Go back to search
    act(() => {
      screen.getByTestId('back-btn').click();
    });
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // "Back to conversation" button should be visible
    expect(screen.getByTestId('back-to-conversation-btn')).toBeDefined();

    // Click it — should navigate to conversation without any new submission
    const submitCallCount = mockSubmit.mock.calls.length;
    act(() => {
      screen.getByTestId('back-to-conversation-btn').click();
    });

    expect(screen.getByTestId('conversation-page')).toBeDefined();
    expect(screen.getByTestId('turn-count').textContent).toBe('2');
    // No new submit call was made
    expect(mockSubmit.mock.calls.length).toBe(submitCallCount);
  });

  it('"Back to conversation" navigates to conversation showing routed turn when no agent-response turn exists', () => {
    const routedInterface = {
      id: 'ri-1',
      useCase: 'search' as const,
      interface: {dispose: vi.fn()},
    };

    // First turn routes to search — no agent response exists yet
    mockConverseState = {
      turns: [
        makeTurn({id: 'turn-1', prompt: 'surfboards', routedInterface: routedInterface as any}),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };

    render(<AppShell />);
    expect(screen.getByTestId('search-results-page')).toBeDefined();

    // The button is always visible
    expect(screen.getByTestId('back-to-conversation-btn')).toBeDefined();

    // Click "Back to conversation" — navigates to conversation with the single routed turn
    act(() => {
      screen.getByTestId('back-to-conversation-btn').click();
    });

    expect(screen.getByTestId('conversation-page')).toBeDefined();
    expect(screen.getByTestId('turn-count').textContent).toBe('1');
    expect(screen.getByTestId('turn-ids').textContent).toBe('turn-1');
  });

  it('navigates to search when a turn has both routedInterface and agentResponse.reasoningSteps (ordering invariant)', () => {
    mockConverseState = {
      turns: [],
      activeTurn: undefined,
      isStreaming: false,
    };

    const {rerender} = render(<AppShell />);
    expect(screen.getByTestId('landing-page')).toBeDefined();

    // Submit a prompt from landing
    act(() => {
      screen.getByTestId('submit-btn').click();
    });

    // Turn arrives with BOTH routedInterface and agentResponse.reasoningSteps
    const mockDispose = vi.fn();
    const routedInterface = {
      id: 'ri-dual',
      useCase: 'search' as const,
      interface: {dispose: mockDispose},
    };

    mockConverseState = {
      turns: [
        makeTurn({
          id: 'turn-dual',
          prompt: 'surfboards',
          routedInterface: routedInterface as any,
          agentResponse: {
            messages: [{content: 'Here are surfboards', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [{type: 'reasoning', content: 'Looking up surfboards'}],
          } as any,
        }),
      ],
      activeTurn: undefined,
      isStreaming: false,
    };
    rerender(<AppShell />);

    // Per the ordering invariant: routedInterface takes precedence → search view
    expect(screen.getByTestId('search-results-page')).toBeDefined();
    expect(screen.getByTestId('routed-interface-id').textContent).toBe('ri-dual');
  });
});
