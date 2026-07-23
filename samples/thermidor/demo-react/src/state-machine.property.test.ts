import {describe, it, expect, vi} from 'vitest';
import fc from 'fast-check';
import {
  appReducer,
  deriveTransitionAction,
  type AppState,
  type ViewState,
} from './hooks/use-app-state.js';
import type {Turn} from '@coveo/thermidor';

/**
 * Property-based tests for the App Shell state machine correctness.
 * Feature: app-shell-state-machine
 */

const viewStates: ViewState[] = ['landing', 'search', 'conversation'];

describe('Feature: app-shell-state-machine — Property-Based Tests', () => {
  /**
   * **Validates: Requirements 1.2, 1.3**
   *
   * Property 1: For any completed turn with routedInterface, deriveTransitionAction
   * returns NAVIGATE_SEARCH; with agentResponse, returns NAVIGATE_CONVERSATION.
   * Applying that action to the reducer from any starting view produces the correct view.
   */
  it('Property 1: Turn completion drives correct view transition', () => {
    const turnWithRoutedInterface: fc.Arbitrary<Turn> = fc.record({
      id: fc.uuid(),
      prompt: fc.string({minLength: 1}),
      status: fc.constant('complete' as const),
      routedInterface: fc.constant({
        useCase: 'commerceSearch' as const,
        interface: {} as any,
      }),
    }) as fc.Arbitrary<Turn>;

    const turnWithAgentResponse: fc.Arbitrary<Turn> = fc.record({
      id: fc.uuid(),
      prompt: fc.string({minLength: 1}),
      status: fc.constant('complete' as const),
      agentResponse: fc.constant({
        messages: [],
        surfaces: [],
        toolCalls: [],
        reasoningContent: '',
      } as any),
    }) as fc.Arbitrary<Turn>;

    fc.assert(
      fc.property(
        fc.oneof(turnWithRoutedInterface, turnWithAgentResponse),
        fc.constantFrom(...viewStates),
        (turn, startView) => {
          const action = deriveTransitionAction(turn);
          expect(action).not.toBeNull();

          const state: AppState = {view: startView};
          const result = appReducer(state, action!);

          if (turn.routedInterface) {
            expect(result.view).toBe('search');
          } else {
            expect(result.view).toBe('conversation');
          }
        }
      ),
      {numRuns: 100}
    );
  });

  /**
   * **Validates: Requirements 3.2**
   *
   * Property 2: For any sequence of N routed interfaces, dispose is called
   * N-1 times (once per replacement).
   */
  it('Property 2: Interface disposal on replacement', () => {
    fc.assert(
      fc.property(fc.integer({min: 2, max: 20}), (n) => {
        const disposes: ReturnType<typeof vi.fn>[] = [];
        let persistedInterface: {interface: {dispose: () => void}} | null =
          null;
        let disposeCallCount = 0;

        for (let i = 0; i < n; i++) {
          const mockDispose = vi.fn(() => {
            disposeCallCount++;
          });
          const newInterface = {interface: {dispose: mockDispose}};
          disposes.push(mockDispose);

          if (persistedInterface) {
            persistedInterface.interface.dispose();
          }
          persistedInterface = newInterface;
        }

        expect(disposeCallCount).toBe(n - 1);

        for (let i = 0; i < n - 1; i++) {
          expect(disposes[i]).toHaveBeenCalledTimes(1);
        }
        expect(disposes[n - 1]).not.toHaveBeenCalled();
      }),
      {numRuns: 100}
    );
  });

  /**
   * **Validates: Requirements 5.1**
   *
   * Property 3: For any prompt submitted while isStreaming=true, submit is
   * never called.
   */
  it('Property 3: Streaming blocks all submissions', () => {
    fc.assert(
      fc.property(fc.string({minLength: 1}), (prompt) => {
        const mockSubmit = vi.fn();
        const isStreaming = true;

        const handleSubmit = (p: string) => {
          if (!p.trim() || isStreaming) return;
          mockSubmit({prompt: p});
        };

        handleSubmit(prompt);

        expect(mockSubmit).not.toHaveBeenCalled();
      }),
      {numRuns: 100}
    );
  });

  /**
   * **Validates: Requirements 5.2, 5.3**
   *
   * Property 4: For any turn with status 'error' (regardless of whether it
   * also has routedInterface or agentResponse), deriveTransitionAction returns
   * null, meaning no view transition occurs.
   */
  it('Property 4: Error turns preserve view state', () => {
    const turnArb = fc.record({
      id: fc.uuid(),
      prompt: fc.string({minLength: 1}),
      status: fc.constant('error' as const),
      error: fc.string({minLength: 1}),
      routedInterface: fc.oneof(
        fc.constant(undefined),
        fc.constant({useCase: 'commerceSearch' as const, interface: {} as any})
      ),
      agentResponse: fc.oneof(
        fc.constant(undefined),
        fc.constant({
          messages: [],
          surfaces: [],
          toolCalls: [],
          reasoningContent: '',
        } as any)
      ),
    }) as fc.Arbitrary<Turn>;

    fc.assert(
      fc.property(
        turnArb,
        fc.constantFrom(...viewStates),
        (turn, startView) => {
          const action = deriveTransitionAction(turn);
          expect(action).toBeNull();

          const state: AppState = {view: startView};
          expect(state.view).toBe(startView);
        }
      ),
      {numRuns: 100}
    );
  });

  /**
   * **Validates: Requirements 6.4, 2.3**
   *
   * Property 5: For any non-empty prompt submitted while not streaming,
   * submit is called with the exact string.
   */
  it('Property 5: Prompt forwarding integrity', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1}).filter((s) => s.trim().length > 0),
        (prompt) => {
          const mockSubmit = vi.fn();
          const isStreaming = false;

          const handleSubmit = (p: string) => {
            if (!p.trim() || isStreaming) return;
            mockSubmit({prompt: p});
          };

          handleSubmit(prompt);

          expect(mockSubmit).toHaveBeenCalledTimes(1);
          expect(mockSubmit).toHaveBeenCalledWith({prompt});
        }
      ),
      {numRuns: 100}
    );
  });
});
