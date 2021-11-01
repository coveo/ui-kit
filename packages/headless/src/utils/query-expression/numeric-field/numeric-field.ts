import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol, NumericOperator} from '../common/operator';
import {Part} from '../common/part';

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
    toString() {
      const {field, value} = config;
      const prefix = getNegationPrefix(config);
      const operator = getOperatorSymbol(config.operator);

      return `${prefix}@${field}${operator}${value}`;
    },
  };
}
