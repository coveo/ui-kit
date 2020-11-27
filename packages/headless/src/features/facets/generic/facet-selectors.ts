import {FacetType} from '../facet-api/request';
import {AnyFacetSetState} from './interfaces/generic-facet-state';

export interface FacetIdConfig {
  type: FacetType;
  field: string;
  state: AnyFacetSetState;
}

export function determineFacetId(config: FacetIdConfig) {
  const {type, field, state} = config;
  const prefix = `${type}_${field}_`;
  const id = calculateId(prefix, state);

  return `${prefix}${id}`;
}

function calculateId(prefix: string, state: AnyFacetSetState) {
  const keys = Object.keys(state);
  return findMaxId(keys, prefix) + 1;
}

function findMaxId(keys: string[], prefix: string) {
  const ids = keys.map((key) => {
    const stringId = key.split(prefix)[1];
    const id = parseInt(stringId, 10);
    return Number.isNaN(id) ? -1 : id;
  });

  const lastNumber = ids.sort().pop();
  return lastNumber ?? -1;
}
