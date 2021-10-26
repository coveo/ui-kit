import {getNegationPrefix, Negatable} from '../common/negatable';
import {Part} from '../common/part';

export interface ExactMatchExpression extends Negatable {
  expression: string;
}

export function buildExactMatch(config: ExactMatchExpression): Part {
  return {
    toString() {
      const prefix = getNegationPrefix(config);
      const {expression} = config;

      return `${prefix}"${expression}"`;
    },
  };
}
