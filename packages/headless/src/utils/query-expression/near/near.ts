import {getNegationPrefix, type Negatable} from '../common/negatable.js';
import type {Part} from '../common/part.js';

export interface NearExpression extends Negatable {
  /**
   * The reference term.
   */
  startTerm: string;

  /**
   * The other terms to check against the reference term. See [NEAR](https://docs.coveo.com/en/1814/#near) for an example.
   */
  otherTerms: OtherTerm[];
}

export interface OtherTerm {
  /**
   * The term to check against the reference term.
   */
  endTerm: string;

  /**
   * The maximum number of keywords that should exist between the current term and the reference term.
   */
  maxKeywordsBetween: number;
}

export function buildNear(config: NearExpression): Part {
  return {
    toQuerySyntax() {
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
