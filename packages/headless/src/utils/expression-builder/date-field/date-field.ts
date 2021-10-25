import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol, NumericOperator} from '../common/operator';
import {Part} from '../common/part';

export interface DateFieldExpression extends Negatable {
  field: string;
  operator: NumericOperator;
  value: string;
}

export function buildDateField(config: DateFieldExpression): Part {
  return {
    toString() {
      const {field, value} = config;
      const operator = getOperatorSymbol(config.operator);
      const prefix = getNegationPrefix(config);
      return `${prefix}@${field}${operator}${value}`;
    },
  };
}
