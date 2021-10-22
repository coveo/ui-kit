import {getNegationPrefix, Negatable} from '../common/negatable';
import {getOperatorSymbol, StringOperator} from '../common/operator';
import {Part} from '../common/part';

export interface StringFieldExpression extends Negatable {
  field: string;
  operator: StringOperator;
  values: string[];
}

export function buildStringField(config: StringFieldExpression): Part {
  return {
    toString() {
      const {field} = config;
      const prefix = getNegationPrefix(config);
      const operator = getOperatorSymbol(config.operator);
      const processed = config.values.map((value) => `"${value}"`);
      const values =
        processed.length === 1 ? processed[0] : `(${processed.join(',')})`;

      return `${prefix}@${field}${operator}${values}`;
    },
  };
}
