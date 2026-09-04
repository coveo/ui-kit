import fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {dispatchStreamEvent, type EventDispatcherDeps} from './unified-event-dispatcher.js';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';

/**
 * Property-based tests for event dispatcher call ordering (Property 7).
 *
 * Validates: Requirements 5.3, 5.4
 *
 * The ACTIVITY_SNAPSHOT handler in `dispatchStreamEvent` MUST call:
 * 1. appendSurface (delivers content to A2-UI renderer)
 * 2. appendActivity (stores activity metadata)
 * 3. onA2uiSurface (routing decision callback) — only for a2ui-surface activityType
 *
 * This ordering guarantees that regardless of which routing path the callback
 * takes (decomposed or legacy), the A2-UI renderer already has the content.
 */

const NUM_RUNS = 100;

describe('Feature: commerce-surface-decomposition, Property 7: A2-UI content is always delivered regardless of path', () => {
  let deps: EventDispatcherDeps;
  let callOrder: string[];

  beforeEach(() => {
    callOrder = [];
    deps = {
      statePort: {
        appendSurface: vi.fn(() => callOrder.push('appendSurface')),
        appendActivity: vi.fn(() => callOrder.push('appendActivity')),
        setRoutedInterface: vi.fn(),
        setConversationSession: vi.fn(),
        startMessage: vi.fn(),
        appendMessageDelta: vi.fn(),
        completeTurn: vi.fn(),
        failTurn: vi.fn(),
        startToolCall: vi.fn(),
        appendToolCallArgs: vi.fn(),
        completeToolCall: vi.fn(),
        startReasoning: vi.fn(),
        appendReasoningDelta: vi.fn(),
        endReasoning: vi.fn(),
        setStateSnapshot: vi.fn(),
      } as unknown as EventDispatcherDeps['statePort'],
      ensureAgentResponse: vi.fn(),
      onA2uiSurface: vi.fn(() => callOrder.push('onA2uiSurface')),
    };
  });

  it('appendSurface and appendActivity are called BEFORE onA2uiSurface for a2ui-surface events', () => {
    /**
     * Validates: Requirements 5.3, 5.4
     *
     * For ANY ACTIVITY_SNAPSHOT event with activityType === 'a2ui-surface',
     * appendSurface and appendActivity SHALL be called before onA2uiSurface.
     * This ensures the A2-UI renderer has the content before routing decisions execute.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
        fc.dictionary(fc.string({minLength: 1, maxLength: 20}), fc.jsonValue({maxDepth: 2})),
        fc.boolean(),
        (turnId, messageId, contentData, replace) => {
          callOrder = [];

          const event = {
            type: 'ACTIVITY_SNAPSHOT',
            messageId,
            activityType: 'a2ui-surface',
            content: contentData,
            replace,
          } as unknown as NormalizedStreamEvent;

          dispatchStreamEvent(turnId, event, deps);

          const appendSurfaceIdx = callOrder.indexOf('appendSurface');
          const appendActivityIdx = callOrder.indexOf('appendActivity');
          const onA2uiSurfaceIdx = callOrder.indexOf('onA2uiSurface');

          expect(appendSurfaceIdx).toBeGreaterThanOrEqual(0);
          expect(appendActivityIdx).toBeGreaterThanOrEqual(0);
          expect(onA2uiSurfaceIdx).toBeGreaterThanOrEqual(0);
          expect(appendSurfaceIdx).toBeLessThan(onA2uiSurfaceIdx);
          expect(appendActivityIdx).toBeLessThan(onA2uiSurfaceIdx);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('appendSurface is called before appendActivity for a2ui-surface events', () => {
    /**
     * Validates: Requirements 5.3, 5.4
     *
     * The specific ordering is appendSurface → appendActivity → onA2uiSurface.
     * appendSurface delivers content first, then metadata is stored.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
        fc.dictionary(fc.string({minLength: 1, maxLength: 20}), fc.jsonValue({maxDepth: 2})),
        fc.boolean(),
        (turnId, messageId, contentData, replace) => {
          callOrder = [];

          const event = {
            type: 'ACTIVITY_SNAPSHOT',
            messageId,
            activityType: 'a2ui-surface',
            content: contentData,
            replace,
          } as unknown as NormalizedStreamEvent;

          dispatchStreamEvent(turnId, event, deps);

          const appendSurfaceIdx = callOrder.indexOf('appendSurface');
          const appendActivityIdx = callOrder.indexOf('appendActivity');

          expect(appendSurfaceIdx).toBeLessThan(appendActivityIdx);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('onA2uiSurface is only called for a2ui-surface activityType, not other activity types', () => {
    /**
     * Validates: Requirements 5.3, 5.4
     *
     * For ACTIVITY_SNAPSHOT events with non-a2ui-surface activityType,
     * appendSurface and appendActivity are still called but onA2uiSurface is NOT called.
     * This confirms the routing callback is exclusively for a2ui-surface events.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}).filter((s) => s !== 'a2ui-surface'),
        fc.dictionary(fc.string({minLength: 1, maxLength: 20}), fc.jsonValue({maxDepth: 2})),
        fc.boolean(),
        (turnId, messageId, activityType, contentData, replace) => {
          callOrder = [];

          const event = {
            type: 'ACTIVITY_SNAPSHOT',
            messageId,
            activityType,
            content: contentData,
            replace,
          } as unknown as NormalizedStreamEvent;

          dispatchStreamEvent(turnId, event, deps);

          const appendSurfaceIdx = callOrder.indexOf('appendSurface');
          const appendActivityIdx = callOrder.indexOf('appendActivity');
          const onA2uiSurfaceIdx = callOrder.indexOf('onA2uiSurface');

          expect(appendSurfaceIdx).toBeGreaterThanOrEqual(0);
          expect(appendActivityIdx).toBeGreaterThanOrEqual(0);
          expect(onA2uiSurfaceIdx).toBe(-1);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('content delivered to appendSurface and onA2uiSurface is the same reference', () => {
    /**
     * Validates: Requirements 5.3, 5.4
     *
     * The content passed to appendSurface is the same object reference as
     * what is passed to onA2uiSurface, guaranteeing the renderer receives
     * exactly what the routing callback processes.
     */
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
        fc.dictionary(fc.string({minLength: 1, maxLength: 20}), fc.jsonValue({maxDepth: 2})),
        (turnId, messageId, contentData) => {
          const event = {
            type: 'ACTIVITY_SNAPSHOT',
            messageId,
            activityType: 'a2ui-surface',
            content: contentData,
            replace: false,
          } as unknown as NormalizedStreamEvent;

          dispatchStreamEvent(turnId, event, deps);

          const surfaceContent = (deps.statePort.appendSurface as ReturnType<typeof vi.fn>).mock
            .calls[0][1];
          const callbackContent = (deps.onA2uiSurface as ReturnType<typeof vi.fn>).mock.calls[0][1];

          expect(surfaceContent).toBe(callbackContent);

          (deps.statePort.appendSurface as ReturnType<typeof vi.fn>).mockClear();
          (deps.onA2uiSurface as ReturnType<typeof vi.fn>).mockClear();
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
