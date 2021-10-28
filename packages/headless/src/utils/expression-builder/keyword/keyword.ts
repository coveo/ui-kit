import {Negatable} from '../common/negatable';
import {Part} from '../common/part';

export interface KeywordExpression extends Negatable {
  /**
   * An expression containing terms to match. Terms can be in any order, and may also be expanded with stemming.
   */
  expression: string;
}

export function buildKeyword(config: KeywordExpression): Part {
  return {
    toString() {
      const {expression, negate} = config;
      return negate ? `NOT (${expression})` : expression;
    },
  };
}
