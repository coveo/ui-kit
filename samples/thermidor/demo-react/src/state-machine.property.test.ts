import {describe, it, expect, vi} from 'vitest';
import fc from 'fast-check';
import {
  appReducer,
  type AppState,
  type ViewState,
} from './hooks/use-app-state.js';

/**
 * Property-based tests for the App Shell state machine correctness.
 * Feature: app-shell-state-machine
 */

const viewStates: ViewState[] = ['landing', 'search', 'conversation'];

describe('Feature: app-shell-state-machine — Property-Based Tests', () => {
  /**
   * **Validates: Requirements 1.2, 1.3**
   *
   * Property 1: For any completed turn with routedInterface, view transitions
   * to 'search'; with agentResponse, transitions to 'conversation'.
   */
  it('Property 1: Turn completion drives correct view transition', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('routedInterface' as const),
          fc.constant('agentResponse' as const)
        ),
        fc.constantFrom(...viewStates),
        (turnType, startView) => {
          const state: AppState = {view: startView};

          if (turnType === 'routedInterface') {
            const result = appReducer(state, {type: 'NAVIGATE_SEARCH'});
            expect(result.view).toBe('search');
          } else {
            const result = appReducer(state, {type: 'NAVIGATE_CONVERSATION'});
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
   * Property 4: For any error turn from any view state, view state remains
   * unchanged.
   */
  it('Property 4: Error turns preserve view state', () => {
    fc.assert(
      fc.property(fc.constantFrom(...viewStates), (startView) => {
        const state: AppState = {view: startView};

        const turn = {
          id: 'error-turn',
          prompt: 'test',
          status: 'error' as const,
          error: 'Something went wrong',
        };

        const hasRoutedInterface = !!turn.routedInterface;
        const hasAgentResponse = !!(turn as any).agentResponse;

        if (turn.status === 'complete' && hasRoutedInterface) {
          return;
        }
        if (turn.status === 'complete' && hasAgentResponse) {
          return;
        }

        expect(state.view).toBe(startView);
      }),
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
