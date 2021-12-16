/**
 * Describe a field value returned by index
 */
export interface FieldValue {
  /**
   * The field value
   */
  value: string;
  /**
   * The number of results in the index which have this value
   */
  numberOfResults: number;
}

export interface FieldValuesResponseSuccess {
  values: FieldValue[];
}
