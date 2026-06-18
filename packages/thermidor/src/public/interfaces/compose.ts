import {
  KIND,
  STATE_ID,
  ENGINE,
  THUNK_FACTORIES,
  THUNKS,
  INTERFACES,
} from '@/src/core/interface/utils/symbols.js';
import type {
  Interface,
  ComposedInterface,
  Operations,
  EndpointStateScope,
  EndpointThunk,
  EndpointThunkFactory,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export function composeInterfaces<T extends keyof Operations>(options: {
  interfaces: Interface<T>[];
}): ComposedInterface<T> {
  if (options.interfaces.length === 0) {
    throw new Error('composeInterfaces requires at least one interface.');
  }

  const engine = options.interfaces[0][ENGINE];

  for (const iface of options.interfaces) {
    if (iface[ENGINE] !== engine) {
      throw new Error('All interfaces must share the same engine.');
    }
  }

  const composedId = generateId();

  const composedThunks = options.interfaces.reduce(
    (acc, iface) => {
      const scope: EndpointStateScope = {
        interfaceId: iface[STATE_ID],
        composedInterfaceId: composedId,
      };

      for (const [operation, factories] of Object.entries(
        iface[THUNK_FACTORIES]
      )) {
        const key = operation as Operations[T];
        acc[key] ??= [];
        acc[key].push(
          ...(factories as EndpointThunkFactory[]).map((factory) =>
            factory(engine, scope)
          )
        );
      }

      return acc;
    },
    {} as Record<Operations[T], EndpointThunk[]>
  );

  return Object.freeze({
    [KIND]: 'composed' as const,
    [STATE_ID]: composedId,
    [ENGINE]: engine,
    [INTERFACES]: options.interfaces as Interface[],
    [THUNKS]: composedThunks,
  });
}
