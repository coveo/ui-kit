import type {CoreEngine, CoreEngineNext} from './engine.js';

/**
 * Represents the type of engine.
 *
 * @internal
 */
export type EngineMarker = 'search' | 'commerce' | 'frankenstein';

const engineMarkerDescription = 'coveo-headless-engine-marker';

/**
 * Symbol key used to store the engine marker on engine instances.
 * Internal-only; not exposed to consumers.
 *
 * @internal
 */
export const engineMarkerKey: unique symbol = Symbol.for(
  engineMarkerDescription
);

/**
 * Retrieves the engine marker from a CoreEngine or CoreEngineNext instance.
 *
 * @internal
 */
export function getEngineMarker(
  engine: CoreEngine | CoreEngineNext
): EngineMarker {
  return (engine as CoreEngine & {[engineMarkerKey]: EngineMarker})[
    engineMarkerKey
  ];
}
