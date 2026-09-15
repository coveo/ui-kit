import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {GenerativeUnifiedInterface} from '@/src/internal/utils/index.js';
import {GenerativeUnifiedInterfaceImpl} from '@/src/internal/interfaces/index.js';

export type {GenerativeUnifiedInterface} from '@/src/internal/utils/index.js';

/**
 * Options for {@link buildGenerativeUnifiedInterface}.
 */
export interface BuildGenerativeUnifiedInterfaceOptions {
  /**
   * The engine the interface is bound to. All controllers built from the
   * returned interface share this engine's state.
   */
  engine: Engine;

  /**
   * A stable identifier for the interface. Provide one to reconcile with a
   * previously-created interface (e.g. across re-renders); otherwise a unique id
   * is generated.
   */
  id?: string;
}

/**
 * Builds a generative unified interface — the entry point for the unified
 * conversation/search experience. The returned interface is passed to the
 * controllers (e.g. {@link buildUnifiedConverseController}) that drive and read
 * its state.
 *
 * @param options - The engine to bind to and an optional stable interface id.
 * @returns A generative unified interface bound to the given engine.
 */
export function buildGenerativeUnifiedInterface(
  options: BuildGenerativeUnifiedInterfaceOptions
): GenerativeUnifiedInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  return new GenerativeUnifiedInterfaceImpl(fullEngine, interfaceId);
}
