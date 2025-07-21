import {getNegationPrefix, type Negatable} from '../common/negatable.js';
import {getOperatorSymbol, type NumericOperator} from '../common/operator.js';
import type {Part} from '../common/part.js';

export interface DateFieldExpression extends Negatable {
  /**
   * The field name.
   */
  field: string;

  /**
   * The operator to use when comparing `field` and `value`. Options for the operator are: `"isExactly" | "lowerThan" | "lowerThanOrEqual" | "greaterThan" | "greaterThanOrEqual"`.
   */
  operator: NumericOperator;

  /**
   * The value to match against the field. For absolute dates, please use form YYYY/MM/DD. For relative dates, please refer to the supported [date/time operators](https://docs.coveo.com/en/1814/#datetime-operators).
   */
  value: string;
}

export function buildDateField(config: DateFieldExpression): Part {
  return {
    toQuerySyntax() {
      const {field, value} = config;
      const operator = getOperatorSymbol(config.operator);
      const prefix = getNegationPrefix(config);
      return `${prefix}@${field}${operator}${value}`;
    },
  };
}
