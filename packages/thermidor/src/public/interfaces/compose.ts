import {
  KIND,
  TYPE,
  STATE_ID,
  ENGINE,
  INTERFACES,
  FACADE_RESOLVERS,
} from '@/src/core/interface/utils/symbols.js';
import type {
  Interface,
  InterfaceType,
  ComposedInterface,
  Facades,
  FacadeResolver,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export function composeInterfaces<T extends InterfaceType>(options: {
  interfaces: Interface<T>[];
}): ComposedInterface<T> {
  if (options.interfaces.length === 0) {
    throw new Error('composeInterfaces requires at least one interface.');
  }

  const engine = options.interfaces[0][ENGINE];
  const type = options.interfaces[0][TYPE];

  for (const iface of options.interfaces) {
    if (iface[ENGINE] !== engine) {
      throw new Error('All interfaces must share the same engine.');
    }
  }

  const composedId = generateId();
  const interfaces = options.interfaces;

  const subMap = new Map(interfaces.map((i) => [i[STATE_ID], i]));

  if (subMap.size !== interfaces.length) {
    throw new Error('Composed interfaces must have unique ids.');
  }

  const facadeNames = Object.keys(interfaces[0][FACADE_RESOLVERS]) as Array<
    Facades[T]
  >;
  const resolvers = Object.fromEntries(
    facadeNames.map((name) => [
      name,
      ((scope) => {
        const sub = subMap.get(scope.interfaceId);
        if (!sub) return undefined as never;
        return sub[FACADE_RESOLVERS][name](scope);
      }) satisfies FacadeResolver,
    ])
  ) as Record<Facades[T], FacadeResolver>;

  return Object.freeze({
    [KIND]: 'composed' as const,
    [TYPE]: type,
    [STATE_ID]: composedId,
    [ENGINE]: engine,
    [INTERFACES]: interfaces,
    [FACADE_RESOLVERS]: resolvers,
  });
}
