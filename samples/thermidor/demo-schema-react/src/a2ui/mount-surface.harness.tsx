import {useEffect, useMemo} from 'react';
import {vi} from 'vitest';
import {render, act, type RenderResult} from '@testing-library/react';
import {
  A2UIProvider,
  A2UIRenderer,
  ROOT_COMPONENT_ID,
  useA2UI,
  type A2UIClientEventMessage,
} from '@copilotkit/a2ui-renderer';
import {createDispatchCoordinator} from '@coveo/thermidor';
import {createThermidorCatalog, THERMIDOR_CATALOG_ID} from './components.js';
import {DispatchProgressProvider, useTrackedDispatch} from './pending-dispatch.js';

/**
 * Shared end-to-end mount for a component definition, through the real thermidor catalog and the
 * A2-UI message pipeline — so tests exercise the actual binder + render path rather than a bare
 * props object:
 *
 *   - `component` is the ROOT node under test (its `id` is forced to `ROOT_COMPONENT_ID`, which
 *     `A2UIRenderer` mounts); scalar/array props are declared as `{ path }` bindings dereferenced
 *     against the surface data model.
 *   - `children` are additional component nodes the root mounts by id via `buildChild`.
 *   - `dataModel` are `updateDataModel` writes (`{ path, value }`) that resolve the bindings.
 *   - actions dispatched through `context.dispatchAction` surface on `onAction` inside a
 *     `{ userAction: { name, surfaceId, sourceComponentId, context, timestamp } }` envelope; this
 *     helper unwraps it so tests assert the inner `{ name, context }` via `lastAction()` / `actions`.
 */

const SURFACE_ID = 'test-surface';

/** The inner user-action delivered on `onAction`'s `userAction` envelope. */
interface DispatchedAction {
  name: string;
  surfaceId: string;
  sourceComponentId?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface MountSurfaceConfig {
  /** Root component node (its `id` is overridden to ROOT_COMPONENT_ID). */
  component: Record<string, unknown>;
  /** Extra component nodes the root mounts by id. */
  children?: Array<Record<string, unknown>>;
  /** Data-model writes that resolve the `{ path }` bindings on the nodes. */
  dataModel?: Array<{path: string; value: unknown}>;
  /** Awaited by the action handler; lets a test hold a dispatch in flight. */
  dispatchGate?: () => Promise<void> | void;
}

export interface MountSurfaceResult extends RenderResult {
  /** Every action dispatched by the mounted tree, unwrapped from its `userAction` envelope. */
  actions: DispatchedAction[];
  /** The most recent dispatched action, or undefined if none. */
  lastAction: () => DispatchedAction | undefined;
  pushDataModel: (updates: Array<{path: string; value: unknown}>) => void;
}

const ROOT_ID = ROOT_COMPONENT_ID;

type ProcessMessages = (messages: Array<Record<string, unknown>>) => void;

function MessagePump({
  messages,
  processRef,
}: {
  messages: Array<Record<string, unknown>>;
  processRef: {current: ProcessMessages | null};
}) {
  const {processMessages} = useA2UI();
  processRef.current = processMessages as ProcessMessages;
  useEffect(() => {
    processMessages(messages);
  }, [processMessages, messages]);
  return null;
}

function Surface({
  messages,
  processRef,
  dispatch,
}: {
  messages: Array<Record<string, unknown>>;
  processRef: {current: ProcessMessages | null};
  dispatch: (message: A2UIClientEventMessage) => Promise<void> | void;
}) {
  const actions = useMemo(
    () => createDispatchCoordinator<A2UIClientEventMessage>(dispatch),
    [dispatch]
  );
  const tracked = useTrackedDispatch(actions);
  return (
    <DispatchProgressProvider value={tracked.progress}>
      <A2UIProvider catalog={createThermidorCatalog()} onAction={tracked.onAction}>
        <MessagePump messages={messages} processRef={processRef} />
        <A2UIRenderer surfaceId={SURFACE_ID} />
      </A2UIProvider>
    </DispatchProgressProvider>
  );
}

/**
 * Mount a surface end-to-end and return the render result plus the captured action log.
 *
 * Awaits nothing itself — callers assert with `await waitFor(...)` as needed (the pump processes
 * messages in an effect, one microtask after mount; dispatched actions resolve asynchronously).
 */
export function mountSurface(config: MountSurfaceConfig): MountSurfaceResult {
  const actions: DispatchedAction[] = [];
  const onAction = vi.fn((message: A2UIClientEventMessage) => {
    const {userAction} = message as unknown as {userAction?: DispatchedAction};
    if (userAction) {
      actions.push(userAction);
    }
    return config.dispatchGate?.();
  });

  const rootNode = {...config.component, id: ROOT_ID};
  const childNodes = config.children ?? [];
  const processRef: {current: ProcessMessages | null} = {current: null};

  const messages: Array<Record<string, unknown>> = [
    {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: THERMIDOR_CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {surfaceId: SURFACE_ID, components: [rootNode, ...childNodes]},
    },
    ...(config.dataModel ?? []).map(({path, value}) => ({
      version: 'v0.9',
      updateDataModel: {surfaceId: SURFACE_ID, path, value},
    })),
  ];

  const result = render(
    <Surface messages={messages} processRef={processRef} dispatch={onAction} />
  );

  return {
    ...result,
    actions,
    lastAction: () => actions.at(-1),
    pushDataModel: (updates) => {
      act(() => {
        processRef.current?.(
          updates.map(({path, value}) => ({
            version: 'v0.9',
            updateDataModel: {surfaceId: SURFACE_ID, path, value},
          }))
        );
      });
    },
  };
}
