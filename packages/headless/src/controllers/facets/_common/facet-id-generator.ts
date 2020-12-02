import {AnyFacetSetState} from '../../../features/facets/generic/interfaces/generic-facet-state';

export interface Logger {
  warn: (message: string) => void;
}

export interface FacetIdConfig {
  field: string;
  state: AnyFacetSetState;
}

export function generateFacetId(config: FacetIdConfig, logger: Logger) {
  const {field, state} = config;
  const fieldIsBeingUsed = field in state;

  if (!fieldIsBeingUsed) {
    return field;
  }

  const prefix = `${field}_`;
  const id = calculateId(prefix, state);

  logWarningMessage(field, logger);

  return `${prefix}${id}`;
}

function calculateId(prefix: string, state: AnyFacetSetState) {
  const keys = Object.keys(state);
  return findMaxId(keys, prefix) + 1;
}

function findMaxId(keys: string[], prefix: string) {
  const defaultId = 0;
  const ids = keys.map((key) => {
    const stringId = key.split(prefix)[1];
    const id = parseInt(stringId, 10);
    return Number.isNaN(id) ? defaultId : id;
  });

  const lastNumber = ids.sort().pop();
  return lastNumber ?? defaultId;
}

function logWarningMessage(field: string, logger: Logger) {
  const message = `A facet with field "${field}" already exists.
  To avoid unexpected behaviour, configure the #id option on the facet controller.`;

  logger.warn(message);
}
