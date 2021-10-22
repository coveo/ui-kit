import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol, NumericOperator} from '../common/operator';
import {Part} from '../common/part';

export interface NumericFieldExpression extends Negatable {
  field: string;
  operator: NumericOperator;
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
