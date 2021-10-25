import {getOperatorSymbol, StringFacetFieldOperator} from '../common/operator';
import {Part} from '../common/part';

export interface StringFacetFieldExpression {
  field: string;
  operator: StringFacetFieldOperator;
  value: string;
}

export function buildStringFacetField(
  config: StringFacetFieldExpression
): Part {
  return {
    toString() {
      const {field, operator, value} = config;
      const symbol = getOperatorSymbol(operator);
      const formattedValue =
        operator === 'fuzzyMatch'
          ? ` $quoteVar(value: ${value})`
          : `("${value}")`;
      return `@${field}${symbol}${formattedValue}`;
    },
  };
}
