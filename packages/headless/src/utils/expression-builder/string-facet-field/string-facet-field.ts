import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol, StringFacetFieldOperator} from '../common/operator';
import {Part} from '../common/part';

export interface StringFacetFieldExpression extends Negatable {
  field: string;
  operator: StringFacetFieldOperator;
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
