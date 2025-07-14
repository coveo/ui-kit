import {getNegationPrefix, type Negatable} from '../common/negatable.js';
import type {Part} from '../common/part.js';

export interface FieldExistsExpression extends Negatable {
  /**
   * The field that should be defined on all matching items.
   */
  field: string;
}

export function buildFieldExists(config: FieldExistsExpression): Part {
  return {
    toQuerySyntax() {
      const prefix = getNegationPrefix(config);
      const {field} = config;
      return `${prefix}@${field}`;
    },
  };
}
