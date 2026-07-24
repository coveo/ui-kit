import {getHandleInternals} from '@/src/internal/utils/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {
  ComposedInterface,
  InferInterfaceType,
  InterfaceType,
  InterfaceTypeMap,
} from '@/src/internal/utils/index.js';
import {ComposedInterfaceImpl} from '@/src/internal/interfaces/index.js';

export type {ComposedInterface} from '@/src/internal/utils/index.js';
export {ComposedInterfaceImpl, getComposedInternals} from '@/src/internal/interfaces/index.js';

export function composeInterfaces<I extends InterfaceTypeMap[InterfaceType]>(options: {
  interfaces: I[];
}): ComposedInterface<InferInterfaceType<I>> {
  if (options.interfaces.length === 0) {
    throw new Error('composeInterfaces requires at least one interface.');
  }

  const first = getHandleInternals(options.interfaces[0]);

  for (const iface of options.interfaces) {
    const internals = getHandleInternals(iface);
    if (internals.engine !== first.engine) {
      throw new Error('All interfaces must share the same engine.');
    }
  }

  return new ComposedInterfaceImpl<InferInterfaceType<I>>(options.interfaces, generateId());
}
