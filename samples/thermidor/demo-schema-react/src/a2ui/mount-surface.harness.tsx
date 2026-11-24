import {useMemo, useState, type JSXElementConstructor, type PropsWithChildren} from 'react';
import {vi} from 'vitest';
import {render, act, type RenderResult} from '@testing-library/react';
import type {A2uiClientMessage, A2uiV09Message} from '@coveo/thermidor';
import {
  createThermidorCatalog,
  THERMIDOR_CATALOG_ID,
  type ThermidorCatalogOptions,
} from './components.js';
import {createFakeSessionRequests} from '../test/fake-session-requests.js';
import {SessionRequestProvider} from './session-request.js';
import {A2UISurface, ThermidorA2UIStream} from './surfaces.js';

/**
 * Shared end-to-end mount for a component definition, through the real thermidor catalog and the
 * A2-UI v0.9 message pipeline — so tests exercise the actual binder + render path rather than a
 * bare props object:
 *
 *   - `component` is the ROOT node under test (its `id` is forced to `root`, which `A2uiSurface`
 *     mounts); scalar/array props are declared as `{ path }` bindings dereferenced against the
 *     surface data model.
 *   - `children` are additional component nodes the root mounts by id via `buildChild`.
 *   - `dataModel` are `updateDataModel` writes (`{ path, value }`) that resolve the bindings.
 *   - actions dispatched through `context.dispatchAction` reach the session's handler inside a
 *     `{ userAction: { name, surfaceId, sourceComponentId, context, timestamp } }` envelope; this
 *     helper unwraps it so tests assert the inner action via `lastAction()` / `actions`.
 */

const SURFACE_ID = 'test-surface';
const ROOT_ID = 'root';

/** The inner user action delivered in the `userAction` envelope. */
type DispatchedAction = NonNullable<A2uiClientMessage['userAction']>;

export interface MountSurfaceConfig {
  /** Root component node (its `id` is overridden to `root`). */
  component: Record<string, unknown>;
  /** Extra component nodes the root mounts by id. */
  children?: Array<Record<string, unknown>>;
  /** Data-model writes that resolve the `{ path }` bindings on the nodes. */
  dataModel?: Array<{path: string; value: unknown}>;
  /** Awaited by the action handler; lets a test hold a dispatch in flight. */
  dispatchGate?: () => Promise<void> | void;
  /** Options for the thermidor catalog the surface renders with. */
  catalogOptions?: ThermidorCatalogOptions;
  /** Wraps the surface, e.g. in the app-level providers its components read. */
  wrapper?: JSXElementConstructor<PropsWithChildren>;
}

export interface MountSurfaceResult extends RenderResult {
  /** Every action dispatched by the mounted tree, unwrapped from its `userAction` envelope. */
  actions: DispatchedAction[];
  /** The most recent dispatched action, or undefined if none. */
  lastAction: () => DispatchedAction | undefined;
  pushDataModel: (updates: Array<{path: string; value: unknown}>) => void;
  /** Streams an `updateComponents` with these nodes, such as one that changes a node's type. */
  pushComponents: (nodes: Array<Record<string, unknown>>) => void;
}

function updateDataModel(path: string, value: unknown): A2uiV09Message {
  return {
    version: 'v0.9',
    updateDataModel: {surfaceId: SURFACE_ID, path, value},
  } as unknown as A2uiV09Message;
}

function Surface({
  initialMessages,
  pushRef,
  dispatch,
  componentOf,
  catalogOptions,
}: {
  initialMessages: readonly A2uiV09Message[];
  pushRef: {current: ((messages: readonly A2uiV09Message[]) => void) | null};
  dispatch: (message: A2uiClientMessage) => Promise<void> | void;
  componentOf: (sourceComponentId: string) => string;
  catalogOptions?: ThermidorCatalogOptions;
}) {
  const catalog = useMemo(() => createThermidorCatalog(catalogOptions), [catalogOptions]);
  const requests = useMemo(
    () => createFakeSessionRequests(dispatch as (message: never) => void, componentOf),
    [dispatch, componentOf]
  );
  const [messages, setMessages] = useState(initialMessages);
  pushRef.current = (more) => setMessages((fed) => [...fed, ...more]);
  return (
    <SessionRequestProvider value={requests.source}>
      <ThermidorA2UIStream catalog={catalog} messages={messages} onAction={requests.dispatch}>
        <A2UISurface surfaceId={SURFACE_ID} />
      </ThermidorA2UIStream>
    </SessionRequestProvider>
  );
}

/**
 * Mount a surface end-to-end and return the render result plus the captured action log.
 *
 * Awaits nothing itself — callers assert with `await waitFor(...)` as needed (the stream feeds
 * messages in an effect, after mount; dispatched actions resolve asynchronously).
 */
export function mountSurface(config: MountSurfaceConfig): MountSurfaceResult {
  const actions: DispatchedAction[] = [];
  const onAction = vi.fn((message: A2uiClientMessage) => {
    if (message.userAction) {
      actions.push(message.userAction);
    }
    return config.dispatchGate?.();
  });

  const rootNode = {...config.component, id: ROOT_ID};
  const childNodes = config.children ?? [];
  const nodes: Array<Record<string, unknown>> = [rootNode, ...childNodes];
  const componentOf = (sourceComponentId: string) =>
    String(nodes.find((node) => node.id === sourceComponentId)?.['component']);
  const pushRef: {current: ((messages: readonly A2uiV09Message[]) => void) | null} = {
    current: null,
  };

  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: THERMIDOR_CATALOG_ID}},
    {version: 'v0.9', updateComponents: {surfaceId: SURFACE_ID, components: nodes}},
  ] as unknown as A2uiV09Message[];
  messages.push(...(config.dataModel ?? []).map(({path, value}) => updateDataModel(path, value)));

  const result = render(
    <Surface
      initialMessages={messages}
      pushRef={pushRef}
      dispatch={onAction}
      componentOf={componentOf}
      catalogOptions={config.catalogOptions}
    />,
    {wrapper: config.wrapper}
  );

  return {
    ...result,
    actions,
    lastAction: () => actions.at(-1),
    pushDataModel: (updates) => {
      act(() => {
        pushRef.current?.(updates.map(({path, value}) => updateDataModel(path, value)));
      });
    },
    pushComponents: (components) => {
      act(() => {
        pushRef.current?.([
          {version: 'v0.9', updateComponents: {surfaceId: SURFACE_ID, components}},
        ] as unknown as A2uiV09Message[]);
      });
    },
  };
}
