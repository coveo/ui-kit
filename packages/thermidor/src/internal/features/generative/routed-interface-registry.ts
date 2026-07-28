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

export interface RoutedInterfaceEntry {
  useCase: RoutedUseCase;
  interface: UseCaseInterfaceMap[RoutedUseCase];
  snapshot: Record<string, unknown>;
  query: string | undefined;
}

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

const CACHE_KEY: CacheKey<RoutedInterfaceRegistry> = createCacheKey<RoutedInterfaceRegistry>(
  'generative/routedInterfaceRegistry'
);

export function getOrCreateRoutedInterfaceRegistry(
  iface: InterfaceHandle
): RoutedInterfaceRegistry {
  const {cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => new RoutedInterfaceRegistry());
}
