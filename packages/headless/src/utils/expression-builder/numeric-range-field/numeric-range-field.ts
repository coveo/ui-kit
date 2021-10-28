import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol} from '../common/operator';
import {Part} from '../common/part';

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
    toString() {
      const prefix = getNegationPrefix(config);
      const {field, from, to} = config;
      const operator = getOperatorSymbol('isExactly');
      return `${prefix}@${field}${operator}${from}..${to}`;
    },
  };
}
