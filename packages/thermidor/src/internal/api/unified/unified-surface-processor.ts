import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {GenerativeStatePort} from '@/src/internal/api/generative/index.js';
import {
  hydrateFromCreateSurface,
  applyDataModelUpdate,
  extractA2uiOperations,
  type ComponentNode,
  type CreateSurfacePayload,
  type A2uiOperation,
} from './unified-surface-hydration.js';

export interface SurfaceProcessorDeps {
  engine: FullEngine;
  statePort: GenerativeStatePort;
  generativeInterface: InterfaceHandle;
  cartInterface: InterfaceHandle;
}

interface SurfaceLifecycleState {
  createSurface: CreateSurfacePayload;
  components?: ComponentNode[];
  dataModel?: Record<string, unknown>;
  interface?: InterfaceHandle;
  rootKind?: string;
}

export function createSurfaceProcessor(deps: SurfaceProcessorDeps) {
  const surfaces = new Map<string, SurfaceLifecycleState>();

  return {
    processSnapshot(turnId: string, content: Record<string, unknown>): void {
      const operations = extractA2uiOperations(content);
      if (operations.length > 0) {
        processOperations(turnId, operations, surfaces, deps);
      }
    },
  };
}

function processOperations(
  turnId: string,
  operations: A2uiOperation[],
  surfaces: Map<string, SurfaceLifecycleState>,
  deps: SurfaceProcessorDeps
): void {
  for (const op of operations) {
    if ('createSurface' in op) {
      const {surfaceId} = op.createSurface;
      if (surfaces.has(surfaceId)) {
        console.warn(
          `Ignoring duplicate A2UI createSurface for existing surfaceId "${surfaceId}".`
        );
        continue;
      }

      const state: SurfaceLifecycleState = {
        createSurface: op.createSurface,
        components: op.createSurface.components,
        dataModel: op.createSurface.dataModel,
      };
      surfaces.set(surfaceId, state);
      maybeHydrate(turnId, surfaceId, state, deps);
    } else if ('updateComponents' in op) {
      const state = surfaces.get(op.updateComponents.surfaceId);
      if (!state) {
        continue;
      }

      state.components = op.updateComponents.components;
      const nextRootKind = getStatefulCommerceRootKind(state.components);
      if (state.interface && nextRootKind !== state.rootKind) {
        state.interface.dispose();
        state.interface = undefined;
        state.rootKind = undefined;
        deps.statePort.clearRoutedInterface(turnId, op.updateComponents.surfaceId);
      }
      maybeHydrate(turnId, op.updateComponents.surfaceId, state, deps);
    } else if ('updateDataModel' in op) {
      const state = surfaces.get(op.updateDataModel.surfaceId);
      if (!state) {
        continue;
      }

      state.dataModel = applyDataModelPatch(
        state.dataModel,
        op.updateDataModel.path,
        op.updateDataModel.value
      );
      if (!state.dataModel && state.interface) {
        state.interface.dispose();
        state.interface = undefined;
        state.rootKind = undefined;
        deps.statePort.clearRoutedInterface(turnId, op.updateDataModel.surfaceId);
      } else if (state.interface) {
        applyDataModelUpdate(
          deps.engine,
          state.interface,
          op.updateDataModel.path,
          op.updateDataModel.value
        );
      }
      maybeHydrate(turnId, op.updateDataModel.surfaceId, state, deps);
    } else if ('deleteSurface' in op) {
      const state = surfaces.get(op.deleteSurface.surfaceId);
      if (state?.interface) {
        state.interface.dispose();
        deps.statePort.clearRoutedInterface(turnId, op.deleteSurface.surfaceId);
      }
      surfaces.delete(op.deleteSurface.surfaceId);
    }
  }
}

function maybeHydrate(
  turnId: string,
  surfaceId: string,
  state: SurfaceLifecycleState,
  deps: SurfaceProcessorDeps
): void {
  if (state.interface || !state.components || !state.dataModel) {
    return;
  }

  const result = hydrateFromCreateSurface(
    deps.engine,
    {
      ...state.createSurface,
      components: state.components,
      dataModel: state.dataModel,
    },
    deps.generativeInterface,
    deps.cartInterface
  );
  if (!result) {
    return;
  }

  state.interface = result.interface;
  state.rootKind = getStatefulCommerceRootKind(state.components);
  deps.statePort.setRoutedInterface(turnId, {
    useCase: result.useCase,
    interface: result.interface,
    snapshot: result.snapshot,
    query: result.query,
    surfaceId,
  });
}

function getStatefulCommerceRootKind(components: ComponentNode[] | undefined): string | undefined {
  const kind = components?.find((component) => component.id === 'root')?.component;
  return kind === 'ProductSearchSurface' || kind === 'ProductListingSurface' ? kind : undefined;
}

export function applyDataModelPatch(
  current: Record<string, unknown> | undefined,
  path: string | undefined,
  value: unknown
): Record<string, unknown> | undefined {
  if (!path || path === '/') {
    return isRecord(value) ? value : undefined;
  }
  if (!path.startsWith('/')) {
    return current;
  }

  const segments = path
    .slice(1)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'));
  const root: Record<string, unknown> = {...(current ?? {})};
  let target: Record<string, unknown> | unknown[] = root;

  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index];
    const nextSegment = segments[index + 1];
    const existing = getContainerValue(target, segment);
    const child = isContainer(existing) ? cloneContainer(existing) : createContainer(nextSegment);
    setContainerValue(target, segment, child);
    target = child;
  }

  const leaf = segments.at(-1);
  if (leaf === undefined) {
    return root;
  }
  if (value === null) {
    deleteContainerValue(target, leaf);
  } else {
    setContainerValue(target, leaf, value);
  }
  return root;
}

function createContainer(nextSegment: string): Record<string, unknown> | unknown[] {
  return isArrayIndex(nextSegment) || nextSegment === '-' ? [] : {};
}

function cloneContainer(
  value: Record<string, unknown> | unknown[]
): Record<string, unknown> | unknown[] {
  return Array.isArray(value) ? [...value] : {...value};
}

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || isRecord(value);
}

function getContainerValue(container: Record<string, unknown> | unknown[], key: string): unknown {
  return Array.isArray(container) ? container[Number(key)] : container[key];
}

function setContainerValue(
  container: Record<string, unknown> | unknown[],
  key: string,
  value: unknown
): void {
  if (Array.isArray(container)) {
    if (key === '-') {
      container.push(value);
    } else if (isArrayIndex(key)) {
      container[Number(key)] = value;
    }
    return;
  }
  container[key] = value;
}

function deleteContainerValue(container: Record<string, unknown> | unknown[], key: string): void {
  if (Array.isArray(container)) {
    if (isArrayIndex(key)) {
      container.splice(Number(key), 1);
    }
    return;
  }
  delete container[key];
}

function isArrayIndex(value: string): boolean {
  return /^(0|[1-9]\d*)$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
