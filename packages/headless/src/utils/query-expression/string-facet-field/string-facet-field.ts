import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol, StringFacetFieldOperator} from '../common/operator';
import {Part} from '../common/part';

export interface StringFacetFieldExpression extends Negatable {
  /**
   * The field name.
   */
  field: string;

  /**
   * The operator to use when comparing `field` and `value`.
   */
  operator: StringFacetFieldOperator;

  /**
   * The value to match against the field.
   */
  value: string;
}

export function buildStringFacetField(
  config: StringFacetFieldExpression
): Part {
  return {
    toString() {
      const prefix = getNegationPrefix(config);
      const {field, operator, value} = config;
      const symbol = getOperatorSymbol(operator);
      const formattedValue =
        operator === 'fuzzyMatch'
          ? ` $quoteVar(value: ${value})`
          : `("${value}")`;

      return `${prefix}@${field}${symbol}${formattedValue}`;
    },
  };
}
