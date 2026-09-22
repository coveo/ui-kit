import {describe, expect, it} from 'vitest';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {createTurn, deriveSurfaces, foldActivities, resolveTargetSurfaceId} from './fold.js';

/**
 * Unit tests for the Turn/TurnResponse shape produced by the fold.
 *
 * Covers the honest input/response split, the presence/absence of `error`, the
 * `state` default, and the agent-facet presence rule ("present ONLY when the
 * router invoked an agent").
 */

const activity = (event: Record<string, unknown>): NormalizedStreamEvent =>
  event as NormalizedStreamEvent;

const runFinished = activity({type: 'RUN_FINISHED'});
const runError = activity({type: 'RUN_ERROR', message: 'boom'});
const textMessageStart = activity({type: 'TEXT_MESSAGE_START', role: 'assistant'});
const stateSnapshot = activity({type: 'STATE_SNAPSHOT', snapshot: {theme: 'dark'}});
const activitySnapshot = activity({
  type: 'ACTIVITY_SNAPSHOT',
  messageId: 'm1',
  activityType: 'commerce-search',
  content: {foo: 'bar'},
});

describe('fold Turn/TurnResponse shape', () => {
  describe('error is present iff status === "error"', () => {
    it('sets status "error" and an error message on a RUN_ERROR sequence', () => {
      const turn = foldActivities(createTurn('t1', {prompt: 'hi'}), [runError]);

      expect(turn.status).toBe('error');
      expect(turn.error).toBe('boom');
    });

    it('omits error on a completed (RUN_FINISHED) sequence', () => {
      const turn = foldActivities(createTurn('t1', {prompt: 'hi'}), [
        textMessageStart,
        runFinished,
      ]);

      expect(turn.status).toBe('complete');
      expect(turn.error).toBeUndefined();
      expect('error' in turn).toBe(false);
    });

    it('omits error while a turn is still streaming', () => {
      const turn = foldActivities(createTurn('t1', {prompt: 'hi'}), [textMessageStart]);

      expect(turn.status).toBe('streaming');
      expect('error' in turn).toBe(false);
    });
  });

  describe('input.prompt', () => {
    it('exposes the submitted prompt at input.prompt', () => {
      const turn = createTurn('t1', {prompt: 'find shoes'});

      expect(turn.input.prompt).toBe('find shoes');
    });

    it('omits input.prompt for a prompt-less (dispatched-action) turn', () => {
      const turn = foldActivities(createTurn('t1', {}), [activitySnapshot]);

      expect(turn.input.prompt).toBeUndefined();
      expect('prompt' in turn.input).toBe(false);
    });
  });

  describe('response.state default', () => {
    it('defaults state to {} before any STATE_SNAPSHOT is folded', () => {
      const turn = createTurn('t1', {prompt: 'hi'});

      expect(turn.response.state).toEqual({});
    });

    it('keeps state at {} for a turn with no STATE_SNAPSHOT', () => {
      const turn = foldActivities(createTurn('t1', {prompt: 'hi'}), [
        textMessageStart,
        runFinished,
      ]);

      expect(turn.response.state).toEqual({});
    });

    it('initializes state from the first STATE_SNAPSHOT', () => {
      const turn = foldActivities(createTurn('t1', {prompt: 'hi'}), [stateSnapshot]);

      expect(turn.response.state).toEqual({theme: 'dark'});
    });
  });

  describe('agent facet presence', () => {
    it('populates response.agent with messages and reasoningSteps when the router invoked an agent', () => {
      const turn = foldActivities(createTurn('t1', {prompt: 'hi'}), [
        textMessageStart,
        activity({type: 'TEXT_MESSAGE_CONTENT', delta: 'hello'}),
        runFinished,
      ]);

      expect(turn.response.agent).toBeDefined();
      expect(turn.response.agent?.messages).toEqual([{content: 'hello', role: 'assistant'}]);
      expect(Array.isArray(turn.response.agent?.reasoningSteps)).toBe(true);
    });

    // The fold's ACTIVITY_SNAPSHOT and STATE_SNAPSHOT cases must not
    // materialize an empty `response.agent` facet. `response.agent` is created
    // only by genuinely agent-invoking events (TEXT_MESSAGE_*,
    // REASONING_MESSAGE_*, TOOL_CALL_*), so a turn the router never routed to an
    // agent has `response.agent` omitted entirely.
    it('omits response.agent for a turn the router did not route to an agent', () => {
      const turn = foldActivities(createTurn('t1', {}), [
        activitySnapshot,
        stateSnapshot,
        runFinished,
      ]);

      expect(turn.response.agent).toBeUndefined();
      expect('agent' in turn.response).toBe(false);
    });
  });
});

/**
 * Surface derivation folded into the fold.
 *
 * The fold computes `response.surfaces` once from the surface-bearing
 * (`a2ui-surface`) activities, and target resolution reads that projection.
 */
const surfaceMessage = (surfaceId: string, rootComponentType: string) => {
  const rootId = `${surfaceId}-root`;
  return {
    version: 'v1.0',
    createSurface: {
      surfaceId,
      rootId,
      components: [{id: rootId, props: {componentType: rootComponentType}}],
    },
  };
};

const surfaceSnapshot = (messages: unknown[]): NormalizedStreamEvent =>
  activity({
    type: 'ACTIVITY_SNAPSHOT',
    messageId: 'surface-activity',
    activityType: 'a2ui-surface',
    content: {messages},
    replace: false,
  });

describe('fold surface derivation', () => {
  it('exposes an empty surfaces list for a turn with no surface-bearing activities', () => {
    const turn = foldActivities(createTurn('t1', {prompt: 'hi'}), [textMessageStart, runFinished]);

    expect(turn.response.surfaces).toEqual([]);
  });

  it('computes surfaceId and rootComponentType once while folding', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshot([surfaceMessage('ui-1', 'commerce-search')]),
      runFinished,
    ]);

    expect(turn.response.surfaces).toEqual([
      {surfaceId: 'ui-1', rootComponentType: 'commerce-search'},
    ]);
  });

  it('preserves activity order across multiple surfaces', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshot([surfaceMessage('c-1', 'converse')]),
      surfaceSnapshot([surfaceMessage('ui-2', 'commerce-search')]),
    ]);

    expect(turn.response.surfaces).toEqual([
      {surfaceId: 'c-1', rootComponentType: 'converse'},
      {surfaceId: 'ui-2', rootComponentType: 'commerce-search'},
    ]);
  });

  it('re-derives an identical list from response.activities', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshot([surfaceMessage('ui-1', 'commerce-search')]),
    ]);

    expect(deriveSurfaces(turn.response.activities)).toEqual(turn.response.surfaces);
  });

  it('skips malformed surface messages (missing root component)', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshot([
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 'ui-1',
            rootId: 'missing',
            components: [{id: 'other', props: {componentType: 'commerce-search'}}],
          },
        },
      ]),
    ]);

    expect(turn.response.surfaces).toEqual([]);
  });
});

describe('resolveTargetSurfaceId', () => {
  it('returns the first commerce-search surfaceId', () => {
    expect(
      resolveTargetSurfaceId([
        {surfaceId: 'c-1', rootComponentType: 'converse'},
        {surfaceId: 'ui-2', rootComponentType: 'commerce-search'},
        {surfaceId: 'ui-3', rootComponentType: 'commerce-search'},
      ])
    ).toBe('ui-2');
  });

  it('returns null when no commerce-search surface exists', () => {
    expect(resolveTargetSurfaceId([{surfaceId: 'c-1', rootComponentType: 'converse'}])).toBeNull();
  });

  it('returns null for an empty surfaces list', () => {
    expect(resolveTargetSurfaceId([])).toBeNull();
  });
});

/**
 * ACTIVITY_SNAPSHOT replace-by-messageId semantics.
 *
 * A snapshot is the latest full version of the content for its `messageId`.
 * When `replace` is set and an activity with the same `messageId` already
 * exists, the fold supersedes it in place rather than appending a duplicate, so
 * a re-emitted surface never leaves a stale entry in `activities` (or in the
 * derived `surfaces`). Matching is by `messageId`, mirroring the sample's
 * `getA2UIMessages` per-activity-id replacement.
 */
const surfaceSnapshotWith = (
  messageId: string,
  replace: boolean,
  messages: unknown[]
): NormalizedStreamEvent =>
  activity({
    type: 'ACTIVITY_SNAPSHOT',
    messageId,
    activityType: 'a2ui-surface',
    content: {messages},
    replace,
  });

describe('fold ACTIVITY_SNAPSHOT replace semantics', () => {
  it('supersedes the activity with the same messageId when replace is true', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshotWith('activity-1', false, [surfaceMessage('ui-old', 'commerce-search')]),
      surfaceSnapshotWith('activity-1', true, [surfaceMessage('ui-new', 'commerce-search')]),
    ]);

    // One activity (replaced in place), carrying the latest payload.
    expect(turn.response.activities).toHaveLength(1);
    expect(turn.response.activities[0].id).toBe('activity-1');
    expect(turn.response.surfaces).toEqual([
      {surfaceId: 'ui-new', rootComponentType: 'commerce-search'},
    ]);
  });

  it('routes to the replacement surface, not the stale one', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshotWith('activity-1', false, [surfaceMessage('stale', 'commerce-search')]),
      surfaceSnapshotWith('activity-1', true, [surfaceMessage('fresh', 'commerce-search')]),
    ]);

    expect(resolveTargetSurfaceId(turn.response.surfaces)).toBe('fresh');
  });

  it('preserves the original position when superseding in place', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshotWith('activity-1', false, [surfaceMessage('a-old', 'converse')]),
      surfaceSnapshotWith('activity-2', false, [surfaceMessage('b', 'commerce-search')]),
      surfaceSnapshotWith('activity-1', true, [surfaceMessage('a-new', 'converse')]),
    ]);

    expect(turn.response.activities.map((a) => a.id)).toEqual(['activity-1', 'activity-2']);
    expect(turn.response.surfaces).toEqual([
      {surfaceId: 'a-new', rootComponentType: 'converse'},
      {surfaceId: 'b', rootComponentType: 'commerce-search'},
    ]);
  });

  it('appends distinct messageIds even when replace is true (no false match)', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshotWith('activity-1', true, [surfaceMessage('s-1', 'commerce-search')]),
      surfaceSnapshotWith('activity-2', true, [surfaceMessage('s-2', 'commerce-search')]),
    ]);

    expect(turn.response.activities).toHaveLength(2);
    expect(turn.response.surfaces).toEqual([
      {surfaceId: 's-1', rootComponentType: 'commerce-search'},
      {surfaceId: 's-2', rootComponentType: 'commerce-search'},
    ]);
  });

  it('appends a same-messageId snapshot when replace is false (append-only fallback)', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshotWith('activity-1', false, [surfaceMessage('s-1', 'converse')]),
      surfaceSnapshotWith('activity-1', false, [surfaceMessage('s-2', 'converse')]),
    ]);

    expect(turn.response.activities).toHaveLength(2);
    expect(turn.response.surfaces).toEqual([
      {surfaceId: 's-1', rootComponentType: 'converse'},
      {surfaceId: 's-2', rootComponentType: 'converse'},
    ]);
  });

  it('re-derives an identical surfaces list from activities after a replacement', () => {
    const turn = foldActivities(createTurn('t1', {}), [
      surfaceSnapshotWith('activity-1', false, [surfaceMessage('ui-old', 'commerce-search')]),
      surfaceSnapshotWith('activity-1', true, [surfaceMessage('ui-new', 'commerce-search')]),
    ]);

    expect(deriveSurfaces(turn.response.activities)).toEqual(turn.response.surfaces);
  });
});
