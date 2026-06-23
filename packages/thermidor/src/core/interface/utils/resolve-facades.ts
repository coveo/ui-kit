import type {
  EndpointThunk,
  EndpointStateScope,
  InterfaceType,
  Interface,
  ComposedInterface,
  Facades,
} from './interface-types.js';
import {KIND, STATE_ID, INTERFACES, FACADE_RESOLVERS} from './symbols.js';

export function resolveFacades<T extends InterfaceType>(
  iface: Interface<T> | ComposedInterface<T>,
  facade: Facades[T]
): EndpointThunk[] {
  if (iface[KIND] === 'composed') {
    const composedId = iface[STATE_ID];
    return iface[INTERFACES].map((sub) => {
      const scope: EndpointStateScope = {
        interfaceId: sub[STATE_ID],
        composedInterfaceId: composedId,
      };
      return sub[FACADE_RESOLVERS][facade](scope);
    });
  }

  const scope: EndpointStateScope = {interfaceId: iface[STATE_ID]};
  return [iface[FACADE_RESOLVERS][facade](scope)];
}
