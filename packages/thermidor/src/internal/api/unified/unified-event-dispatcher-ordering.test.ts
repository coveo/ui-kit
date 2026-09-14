import fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {dispatchStreamEvent, type EventDispatcherDeps} from './unified-event-dispatcher.js';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';

/**
 * Property-based tests for event dispatcher call ordering.
 *
 * The ACTIVITY_SNAPSHOT handler in `dispatchStreamEvent` MUST call:
 * 1. appendSurface (delivers content to the A2-UI consumer)
 * 2. appendActivity (stores activity metadata)
 *
 * This ordering guarantees the A2-UI consumer receives the content before the
 * activity metadata is recorded.
 */

const NUM_RUNS = 100;

describe('Feature: A2-UI content delivery ordering', () => {
  let deps: EventDispatcherDeps;
  let callOrder: string[];

  beforeEach(() => {
    callOrder = [];
    deps = {
      statePort: {
        appendSurface: vi.fn(() => callOrder.push('appendSurface')),
        appendActivity: vi.fn(() => callOrder.push('appendActivity')),
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
    };
  });

  it('appendSurface is called before appendActivity for ACTIVITY_SNAPSHOT events', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
        fc.string({minLength: 1, maxLength: 50}),
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

          expect(appendSurfaceIdx).toBeGreaterThanOrEqual(0);
          expect(appendActivityIdx).toBeGreaterThanOrEqual(0);
          expect(appendSurfaceIdx).toBeLessThan(appendActivityIdx);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
