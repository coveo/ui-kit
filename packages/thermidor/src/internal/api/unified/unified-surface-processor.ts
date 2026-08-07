import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {GenerativeStatePort} from '@/src/internal/api/generative/index.js';
import {
  hydrateFromCreateSurface,
  applyDataModelUpdate,
  extractA2uiOperations,
  type A2uiOperation,
} from './unified-surface-hydration.js';

export interface SurfaceProcessorDeps {
  engine: FullEngine;
  statePort: GenerativeStatePort;
  generativeInterface: InterfaceHandle;
  cartInterface: InterfaceHandle;
}

export function createSurfaceProcessor(deps: SurfaceProcessorDeps) {
  const surfaceMap = new Map<string, InterfaceHandle>();

  return {
    processSnapshot(turnId: string, content: Record<string, unknown>): void {
      const operations = extractA2uiOperations(content);
      if (operations.length > 0) {
        processOperations(turnId, operations, surfaceMap, deps);
      }
    },
  };
}

function processOperations(
  turnId: string,
  operations: A2uiOperation[],
  surfaceMap: Map<string, InterfaceHandle>,
  deps: SurfaceProcessorDeps
): void {
  for (const op of operations) {
    if ('createSurface' in op) {
      const existingIface = surfaceMap.get(op.createSurface.surfaceId);
      if (existingIface) {
        existingIface.dispose();
      }

      const result = hydrateFromCreateSurface(
        deps.engine,
        op.createSurface,
        deps.generativeInterface,
        deps.cartInterface
      );
      if (result) {
        surfaceMap.set(result.surfaceId, result.interface);
        deps.statePort.setRoutedInterface(turnId, {
          useCase: result.useCase,
          interface: result.interface,
          snapshot: result.snapshot,
          query: result.query,
          surfaceId: result.surfaceId,
        });
      }
    } else if ('updateDataModel' in op) {
      const iface = surfaceMap.get(op.updateDataModel.surfaceId);
      if (iface) {
        applyDataModelUpdate(deps.engine, iface, op.updateDataModel.path, op.updateDataModel.value);
      }
    }
  }
}
