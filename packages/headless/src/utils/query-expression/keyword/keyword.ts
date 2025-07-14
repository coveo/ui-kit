import type {Negatable} from '../common/negatable.js';
import type {Part} from '../common/part.js';

export interface KeywordExpression extends Negatable {
  /**
   * An expression containing terms to match. Terms can be in any order, and may also be expanded with stemming.
   *
   * e.g. specifying `Star Wars` will return items containing either `Star` or `Wars` or both.
   */
  expression: string;
}

export function buildKeyword(config: KeywordExpression): Part {
  return {
    toQuerySyntax() {
      const {expression, negate} = config;
      return negate ? `NOT (${expression})` : expression;
    },
  };
}
