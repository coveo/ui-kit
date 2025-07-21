import {getNegationPrefix, type Negatable} from '../common/negatable.js';
import {
  getOperatorSymbol,
  type StringFacetFieldOperator,
} from '../common/operator.js';
import type {Part} from '../common/part.js';

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
    toQuerySyntax() {
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
