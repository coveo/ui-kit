import {getNegationPrefix, type Negatable} from '../common/negatable.js';
import type {Part} from '../common/part.js';

export interface ExactMatchExpression extends Negatable {
  /**
   * An expression that must appear in its entirety at least once for an item to be returned.
   *
   * e.g. specifying `Star Wars` will only return items containing the exact phrase.
   */
  expression: string;
}

export function buildExactMatch(config: ExactMatchExpression): Part {
  return {
    toQuerySyntax() {
      const prefix = getNegationPrefix(config);
      const {expression} = config;

      return `${prefix}"${expression}"`;
    },
  };
}
