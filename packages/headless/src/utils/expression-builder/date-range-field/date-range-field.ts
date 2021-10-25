import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol} from '../common/operator';
import {Part} from '../common/part';

export interface DateRangeFieldExpression extends Negatable {
  field: string;
  from: string;
  to: string;
}

export function buildDateRangeField(config: DateRangeFieldExpression): Part {
  return {
    toString() {
      const prefix = getNegationPrefix(config);
      const {field, from, to} = config;
      const operator = getOperatorSymbol('isExactly');
      return `${prefix}@${field}${operator}${from}..${to}`;
    },
  };
}
