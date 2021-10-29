import {getNegationPrefix, Negatable} from '../common/negatable';
import {Part} from '../common/part';

export interface FieldExistsExpression extends Negatable {
  field: string;
}

export function buildFieldExists(config: FieldExistsExpression): Part {
  return {
    toString() {
      const prefix = getNegationPrefix(config);
      const {field} = config;
      return `${prefix}@${field}`;
    },
  };
}
