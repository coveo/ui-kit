import {FacetType} from '../../../features/facets/facet-api/request';
import {AnyFacetSetState} from '../../../features/facets/generic/interfaces/generic-facet-state';

export interface Logger {
  warn: (message: string) => void;
}

export interface FacetIdConfig {
  type: FacetType;
  field: string;
  state: AnyFacetSetState;
}

export function generateFacetId(
  config: FacetIdConfig,
  logger: Logger = console
) {
  const {type, field, state} = config;

  const prefix = `${type}_${field}_`;
  const id = calculateId(prefix, state);

  logWarningMessageIfNeeded(id, field, logger);

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

function logWarningMessageIfNeeded(id: number, field: string, logger: Logger) {
  if (id === 0) {
    return;
  }

  const message = `A facet with field "${field}" already exists.
  To avoid unexpected behaviour, configure the #id option on the facet controller.`;

  logger.warn(message);
}
