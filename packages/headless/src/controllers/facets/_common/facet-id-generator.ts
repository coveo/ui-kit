import {AllFacetSections} from '../../../features/facets/generic/interfaces/generic-facet-section';

export interface Logger {
  warn: (message: string) => void;
}

export interface FacetIdConfig {
  field: string;
  state: Partial<AllFacetSections>;
}

export function generateFacetId(config: FacetIdConfig, logger: Logger) {
  const {field, state} = config;

  if (!isFieldBeingUsed(config)) {
    return field;
  }

  const prefix = `${field}_`;
  const id = calculateId(prefix, state);

  logWarningMessage(field, logger);

  return `${prefix}${id}`;
}

function isFieldBeingUsed(config: FacetIdConfig) {
  const {field, state} = config;
  const {facetSet} = state;

  const isInFacetSet = facetSet && field in facetSet;
  return isInFacetSet;
}

function calculateId(prefix: string, state: Partial<AllFacetSections>) {
  const keys = Object.keys(state.facetSet || {});
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
