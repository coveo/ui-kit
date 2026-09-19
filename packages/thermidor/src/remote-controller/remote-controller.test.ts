import {describe, expect, it, vi} from 'vitest';
import {z} from 'zod/v4';
import type {RemoteAction} from '@/src/session/create-session.js';
import type {Turn} from '@/src/session/types.js';
import {buildRemoteController, type RemoteControllerSource} from './remote-controller.js';
import type {ContractsSchema} from './types.js';

/**
 * A minimal Zod v4 discriminated-union contracts schema exercising the remote
 * controller: one `pagination` component with a `state` schema and a
 * `selectPage` action whose payload is validated. The `z.strictObject` /
 * `z.core.$strict` spelling matches the `ContractsSchema` type constraint.
 */
const contracts = z.discriminatedUnion('componentType', [
  z.strictObject({
    componentType: z.literal('pagination'),
    state: z.strictObject({page: z.number()}),
    actions: z.strictObject({
      selectPage: z.strictObject({payload: z.strictObject({page: z.number()})}),
    }),
  }),
]) as unknown as ContractsSchema;

const COMPONENT_ID = 'pager';
const COMPONENT_TYPE = 'pagination';

/**
 * Builds a runtime `Turn` whose active-turn component snapshot is `component`
 * under `response.state.components[COMPONENT_ID]`. Passing `undefined` omits the
 * entry entirely; passing `{}` writes an explicitly-empty entry.
 */
function turnWithComponent(id: string, component: Record<string, unknown> | undefined): Turn {
  const components: Record<string, unknown> = {};
  if (component !== undefined) {
    components[COMPONENT_ID] = component;
  }
  return {
    id,
    input: {},
    response: {state: {components}, activities: [], surfaces: []},
    status: 'complete',
  };
}

/**
 * A fake {@link RemoteControllerSource} holding a mutable snapshot and a set of
 * listeners, so tests can push a new state and notify subscribers to simulate
 * both snapshot changes and active-turn changes without a live session.
 */
function createFakeSource(initial: {turns: readonly Turn[]; activeTurnId?: string}) {
  let current = initial;
  const listeners = new Set<() => void>();
  const dispatchAction = vi.fn<(action: RemoteAction) => Promise<void>>(() => Promise.resolve());

  const source: RemoteControllerSource = {
    state: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatchAction,
  };

  function push(next: {turns: readonly Turn[]; activeTurnId?: string}) {
    current = next;
    for (const listener of listeners) {
      listener();
    }
  }

  return {source, push, dispatchAction};
}

function build(source: RemoteControllerSource) {
  return buildRemoteController({
    source,
    componentId: COMPONENT_ID,
    componentType: COMPONENT_TYPE,
    contracts,
  });
}

describe('buildRemoteController', () => {
  describe('state derivation on snapshot change', () => {
    it('re-derives and re-validates state when the active snapshot changes to a different value', () => {
      const {source, push} = createFakeSource({
        turns: [turnWithComponent('t1', {page: 1})],
        activeTurnId: 't1',
      });
      const controller = build(source);

      expect(controller.state).toEqual({page: 1});

      push({turns: [turnWithComponent('t1', {page: 2})], activeTurnId: 't1'});

      expect(controller.state).toEqual({page: 2});
    });

    it('notifies subscribers exactly once per state change', () => {
      const {source, push} = createFakeSource({
        turns: [turnWithComponent('t1', {page: 1})],
        activeTurnId: 't1',
      });
      const controller = build(source);
      const listener = vi.fn();
      controller.subscribe(listener);

      push({turns: [turnWithComponent('t1', {page: 2})], activeTurnId: 't1'});

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('does not notify subscribers when the derived state is unchanged', () => {
      const turn = turnWithComponent('t1', {page: 1});
      const {source, push} = createFakeSource({turns: [turn], activeTurnId: 't1'});
      const controller = build(source);
      const listener = vi.fn();
      controller.subscribe(listener);

      // A store change that leaves the same component snapshot in place.
      push({turns: [turn], activeTurnId: 't1'});

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('re-point on active-turn change', () => {
    it('re-points to the new active turn snapshot and exposes its validated state', () => {
      const {source, push} = createFakeSource({
        turns: [turnWithComponent('t3', {page: 3})],
        activeTurnId: 't3',
      });
      const controller = build(source);

      expect(controller.state).toEqual({page: 3});

      push({
        turns: [turnWithComponent('t3', {page: 3}), turnWithComponent('t5', {page: 5})],
        activeTurnId: 't5',
      });

      expect(controller.state).toEqual({page: 5});
    });

    it('notifies subscribers when the active turn changes the exposed state', () => {
      const {source, push} = createFakeSource({
        turns: [turnWithComponent('t3', {page: 3})],
        activeTurnId: 't3',
      });
      const controller = build(source);
      const listener = vi.fn();
      controller.subscribe(listener);

      push({
        turns: [turnWithComponent('t3', {page: 3}), turnWithComponent('t5', {page: 5})],
        activeTurnId: 't5',
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('missing or empty snapshot', () => {
    it('exposes undefined when the active turn has no entry for the component', () => {
      const {source} = createFakeSource({
        turns: [turnWithComponent('t1', undefined)],
        activeTurnId: 't1',
      });
      const controller = build(source);

      expect(controller.state).toBeUndefined();
    });

    it('exposes undefined when the component entry is an empty object', () => {
      const {source} = createFakeSource({
        turns: [turnWithComponent('t1', {})],
        activeTurnId: 't1',
      });
      const controller = build(source);

      expect(controller.state).toBeUndefined();
    });

    it('exposes undefined when there is no active turn', () => {
      const {source} = createFakeSource({turns: []});
      const controller = build(source);

      expect(controller.state).toBeUndefined();
    });
  });

  describe('dispatch forwarding', () => {
    it('forwards a validated payload to the source dispatchAction and resolves after it resolves', async () => {
      let resolveDispatch: (() => void) | undefined;
      const {source, dispatchAction} = createFakeSource({
        turns: [turnWithComponent('t1', {page: 1})],
        activeTurnId: 't1',
      });
      dispatchAction.mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveDispatch = resolve;
          })
      );
      const controller = build(source);

      let settled = false;
      const dispatched = controller.dispatch('selectPage', {page: 4}).then(() => {
        settled = true;
      });

      expect(dispatchAction).toHaveBeenCalledWith({
        componentId: COMPONENT_ID,
        componentType: COMPONENT_TYPE,
        action: 'selectPage',
        payload: {page: 4},
      });
      expect(settled).toBe(false);

      resolveDispatch?.();
      await dispatched;

      expect(settled).toBe(true);
    });
  });

  describe('unknown action rejection', () => {
    it('rejects with an unknown-action error and does not call dispatchAction', async () => {
      const {source, dispatchAction} = createFakeSource({
        turns: [turnWithComponent('t1', {page: 1})],
        activeTurnId: 't1',
      });
      const controller = build(source);

      await expect(
        // biome-ignore lint/suspicious/noExplicitAny: exercising an unknown action name at runtime
        controller.dispatch('unknownAction' as any, {page: 1} as any)
      ).rejects.toThrow(/not defined in the contract/);
      expect(dispatchAction).not.toHaveBeenCalled();
    });
  });

  describe('invalid payload rejection', () => {
    it('rejects with an invalid-payload error and does not call dispatchAction', async () => {
      const {source, dispatchAction} = createFakeSource({
        turns: [turnWithComponent('t1', {page: 1})],
        activeTurnId: 't1',
      });
      const controller = build(source);

      await expect(
        // biome-ignore lint/suspicious/noExplicitAny: exercising an invalid payload at runtime
        controller.dispatch('selectPage', {page: 'not-a-number'} as any)
      ).rejects.toThrow(/failed schema validation/);
      expect(dispatchAction).not.toHaveBeenCalled();
    });
  });
});
