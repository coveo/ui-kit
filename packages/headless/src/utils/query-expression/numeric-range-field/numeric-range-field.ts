import {getNegationPrefix, type Negatable} from '../common/negatable.js';
import {getOperatorSymbol} from '../common/operator.js';
import type {Part} from '../common/part.js';

export interface NumericRangeFieldExpression extends Negatable {
  /**
   * The field name.
   */
  field: string;

  /**
   * The start of the range.
   */
  from: number;

  /**
   * The end of the range.
   */
  to: number;
}

export function buildNumericRangeField(
  config: NumericRangeFieldExpression
): Part {
  return {
    toQuerySyntax() {
      const prefix = getNegationPrefix(config);
      const {field, from, to} = config;
      const operator = getOperatorSymbol('isExactly');
      return `${prefix}@${field}${operator}${from}..${to}`;
    },
  };
}
