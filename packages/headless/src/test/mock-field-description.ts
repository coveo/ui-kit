import type {FieldDescription} from '../api/search/fields/fields-response.js';

export function buildMockFieldDescription(
  config: Partial<FieldDescription> = {}
): FieldDescription {
  return {
    defaultValue: 'defaultValue',
    description: 'the description',
    fieldSourceType: 'fieldSourceType',
    fieldType: 'fieldType',
    name: 'name',
    type: 'type',
    groupByField: false,
    includeInQuery: false,
    includeInResults: false,
    sortByField: false,
    splitGroupByField: false,
    ...config,
  };
}
