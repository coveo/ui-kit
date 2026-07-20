import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {
  RoutedInterface,
  RoutedUseCase,
  StateTurn,
  Turn,
  UseCaseInterfaceMap,
} from './generative-types.js';

/**
 * Entry stored in the routed interface registry.
 * Contains the non-serializable interface instance alongside the
 * serialization-friendly snapshot data needed for restore.
 */
export interface RoutedInterfaceEntry {
  useCase: RoutedUseCase;
  interface: UseCaseInterfaceMap[RoutedUseCase];
  /** The raw API response content used to hydrate the sub-interface. */
  snapshot: Record<string, unknown>;
  /** The query that was active when the routed interface was created. */
  query: string | undefined;
}

/**
 * A side-registry that holds non-serializable routed interface instances
 * outside the store.
 *
 * Keyed by turnId. Scoped per generative interface via the cacheRegistry pattern.
 */
export class RoutedInterfaceRegistry {
  #entries = new Map<string, RoutedInterfaceEntry>();

  register(turnId: string, entry: RoutedInterfaceEntry): void {
    this.#entries.set(turnId, entry);
  }

  get(turnId: string): RoutedInterfaceEntry | undefined {
    return this.#entries.get(turnId);
  }

  remove(turnId: string): void {
    this.#entries.delete(turnId);
  }

  clear(): void {
    this.#entries.clear();
  }

  entries(): IterableIterator<[string, RoutedInterfaceEntry]> {
    return this.#entries.entries();
  }
}

/**
 * Merges serializable state turns with the registry to produce
 * full turns containing non-serializable interface instances.
 */
export function mergeTurnsWithRegistry(
  stateTurns: StateTurn[],
  registry: RoutedInterfaceRegistry
): Turn[] {
  return stateTurns.map((stateTurn): Turn => {
    if (!stateTurn.routedInterface) {
      return stateTurn as Turn;
    }

    const entry = registry.get(stateTurn.id);
    if (!entry) {
      // Registry entry not available (e.g. restored without snapshot).
      // Strip routedInterface to avoid exposing an incomplete object
      // without the required `interface` field.
      const {routedInterface: _, ...rest} = stateTurn;
      return rest as Turn;
    }

    return {
      ...stateTurn,
      routedInterface: buildRoutedInterface(entry),
    };
  });
}

function buildRoutedInterface(entry: RoutedInterfaceEntry): RoutedInterface {
  switch (entry.useCase) {
    case 'commerceSearch':
      return {
        useCase: 'commerceSearch',
        interface: entry.interface as UseCaseInterfaceMap['commerceSearch'],
      };
    case 'search':
      return {
        useCase: 'search',
        interface: entry.interface as UseCaseInterfaceMap['search'],
      };
  }
}

const CACHE_KEY: CacheKey<RoutedInterfaceRegistry> =
  createCacheKey<RoutedInterfaceRegistry>('generative/routedInterfaceRegistry');

export function getOrCreateRoutedInterfaceRegistry(
  iface: InterfaceHandle
): RoutedInterfaceRegistry {
  const {cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(
    CACHE_KEY,
    () => new RoutedInterfaceRegistry()
  );
}
