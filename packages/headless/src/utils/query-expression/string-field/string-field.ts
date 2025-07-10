import {getNegationPrefix, type Negatable} from '../common/negatable.js';
import {getOperatorSymbol, type StringOperator} from '../common/operator.js';
import type {Part} from '../common/part.js';

export interface StringFieldExpression extends Negatable {
  /**
   * The field name.
   */
  field: string;

  /**
   * The operator to use when comparing `field` and `values`.
   */
  operator: StringOperator;

  /**
   * The values to match against the field.
   */
  values: string[];
}

export function buildStringField(config: StringFieldExpression): Part {
  return {
    toQuerySyntax() {
      const {field} = config;
      const prefix = getNegationPrefix(config);
      const operator = getOperatorSymbol(config.operator);
      const processed = config.values.map((value) => `"${value}"`);
      const values =
        processed.length === 1 ? processed[0] : `(${processed.join(',')})`;

      return `${prefix}@${field}${operator}${values}`;
    },
  };
}
