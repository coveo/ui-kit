import type {Logger} from 'pino';
import type {AllFacetSections} from '../../../../features/facets/generic/interfaces/generic-facet-section.js';

export interface FacetIdConfig {
  field: string;
  state: Partial<AllFacetSections>;
}

export function generateFacetId(config: FacetIdConfig, logger: Logger) {
  const {field, state} = config;

  if (!isFieldUsedAsFacetId(config)) {
    return field;
  }

  const prefix = `${field}_`;
  const id = calculateId(prefix, state);

  logWarningMessage(field, logger);

  return `${prefix}${id}`;
}

function isFieldUsedAsFacetId(config: FacetIdConfig) {
  const {field, state} = config;
  const sets = extractFacetSets(state);

  return sets.some((set) => set && field in set);
}

function calculateId(prefix: string, state: Partial<AllFacetSections>) {
  const sets = extractFacetSets(state);
  const keys = sets
    .map((set) => Object.keys(set || {}))
    .reduce((all, current) => all.concat(current), []);

  return findMaxId(keys, prefix) + 1;
}

function extractFacetSets(state: Partial<AllFacetSections>) {
  const {facetSet, numericFacetSet, dateFacetSet, categoryFacetSet} = state;
  return [facetSet, numericFacetSet, dateFacetSet, categoryFacetSet];
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
