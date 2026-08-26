import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {
  HydratedUseCase,
  RoutedInterface,
  StateTurn,
  Turn,
  UseCaseInterfaceMap,
} from './generative-types.js';

export interface RoutedInterfaceEntry {
  useCase: HydratedUseCase;
  interface: UseCaseInterfaceMap[HydratedUseCase];
  snapshot: Record<string, unknown>;
  query: string | undefined;
  surfaceId?: string;
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

    if (stateTurn.routedInterface.useCase === 'decomposedCommerceSearch') {
      return {...stateTurn, routedInterface: stateTurn.routedInterface} as Turn;
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
  const {cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => new RoutedInterfaceRegistry());
}
