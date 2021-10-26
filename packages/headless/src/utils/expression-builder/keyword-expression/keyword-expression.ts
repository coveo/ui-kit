import {Negatable} from '../common/negatable';
import {Part} from '../common/part';

export interface KeywordExpression extends Negatable {
  expression: string;
}

export function buildKeywordExpression(config: KeywordExpression): Part {
  return {
    toString() {
      const {expression, negate} = config;
      return negate ? `NOT (${expression})` : expression;
    },
  };
}
