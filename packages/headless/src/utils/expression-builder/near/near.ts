import {getNegationPrefix, Negatable} from '../common/negatable';
import {Part} from '../common/part';

export interface NearExpression extends Negatable {
  startTerm: string;
  otherTerms: OtherTerm[];
}

interface OtherTerm {
  endTerm: string;
  maxKeywordsBetween: number;
}

export function buildNear(config: NearExpression): Part {
  return {
    toString() {
      const prefix = getNegationPrefix(config);
      const {startTerm, otherTerms} = config;
      const otherTermsExpression = buildOtherTerms(otherTerms);
      const expression = `${startTerm} ${otherTermsExpression}`;

      return config.negate ? `${prefix}(${expression})` : expression;
    },
  };
}

function buildOtherTerms(terms: OtherTerm[]) {
  return terms
    .map((term) => {
      const {endTerm, maxKeywordsBetween} = term;
      return `near:${maxKeywordsBetween} ${endTerm}`;
    })
    .join(' ');
}
