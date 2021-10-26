import {getNegationPrefix, Negatable} from '../common/negatable';
import {Part} from '../common/part';

export interface NearExpression extends Negatable {
  startTerm: string;
  endTerm: string;
  maxKeywordsBetween: number;
}

export function buildNear(config: NearExpression): Part {
  return {
    toString() {
      const prefix = getNegationPrefix(config);
      const {startTerm, maxKeywordsBetween, endTerm} = config;
      const expression = `${startTerm} near:${maxKeywordsBetween} ${endTerm}`;

      return config.negate ? `${prefix}(${expression})` : expression;
    },
  };
}
