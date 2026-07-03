import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

export const setQuery = (
  query: string,
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreateSearchBoxActions(iface);
  return actions.setQuery(query);
};
