/**
 * Field description
 */
export interface FieldDescription {
  /**
   * The field type.
   */
  type: string;
  /**
   * The field name.
   */
  name: string;
  /**
   * A modest description of the field.
   */
  description: string;
  /**
   * The default value of the field.
   */
  defaultValue: string;
  /**
   * The `fieldType` (eg., Date, Double, Integer, LargeString, Long, SmallString).
   */
  fieldType: string;
  /**
   * The `fieldSourceType`.
   */
  fieldSourceType: string;
  /**
   * Whether the field can be referenced in a query.
   */
  includeInQuery: boolean;
  /**
   * Whether the field is returned with results.
   */
  includeInResults: boolean;
  /**
   * Whether the field is considered `groupBy` (facet).
   */
  groupByField: boolean;
  /**
   * Whether the field is considered `splitGroupBy` (ie., facet with values delimited by `;`).
   */
  splitGroupByField: boolean;
  /**
   * Whether the field can be used to sort results.
   */
  sortByField: boolean;
}

/**
 * Describes the fields available in the index.
 */
export interface FieldDescriptionsResponseSuccess {
  /**
   * The description of all fields available.
   */
  fields: FieldDescription[];
}
