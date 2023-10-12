import {getNegationPrefix, Negatable} from '../common/negatable.js';
import {getOperatorSymbol, NumericOperator} from '../common/operator.js';
import {Part} from '../common/part.js';

export interface NumericFieldExpression extends Negatable {
  /**
   * The field name.
   */
  field: string;

  /**
   * The operator to use when comparing `field` and `value`.
   */
  operator: NumericOperator;

  /**
   * The value to match against the field.
   */
  value: number;
}

export function buildNumericField(config: NumericFieldExpression): Part {
  return {
    toQuerySyntax() {
      const {field, value} = config;
      const prefix = getNegationPrefix(config);
      const operator = getOperatorSymbol(config.operator);

      return `${prefix}@${field}${operator}${value}`;
    },
  };
}
