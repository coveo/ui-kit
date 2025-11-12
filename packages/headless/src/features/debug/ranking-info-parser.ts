export interface RankingInformation {
  /**
   * The attributes of the document that contributed to its ranking.
   * */
  documentWeights: DocumentWeights | null;

  /**
   * The weight attributed to each term in the query.
   */
  termsWeight: TermWeightReport | null;

  /**
   * The sum of all weights.
   */
  totalWeight: number | null;

  /**
   * The weights applied by query ranking expressions.
   */
  qreWeights: QueryRankingExpressionWeights[];
}

export interface DocumentWeights {
  /**
   * The effect of proximity of query terms in the document. More weight is given to documents having the terms closer together.
   */
  Adjacency: number;

  /**
   * The weight attributed to user ratings.
   */
  'Collaborative rating': number;

  /**
   * The weight assigned through an [indexing pipeline extension (IPE)](https://docs.coveo.com/en/206/) for the item.
   */
  Custom: number;

  /**
   * The weight attributed to the document date.
   */
  Date: number;

  /**
   * The weight applied by a [query ranking expression (QRE)](https://docs.coveo.com/en/2777/).
   */
  QRE: number;

  /**
   * The weight attributed to rank of the document in the documents remaining after filtering indexed items by query terms and user permissions.
   * See [item weighting](https://docs.coveo.com/en/1624/#phase-2-item-weighting) for more information.
   */
  Quality: number;

  /**
   * The weight applied by a [ranking function](https://docs.coveo.com/en/1448/).
   */
  'Ranking functions': number;

  /**
   * The effect of the reputation of the document source on the ranking.
   */
  Source: number;

  /**
   * The weight attributed to presence of query terms in the document title.
   */
  Title: number;

  /**
   * Custom factors affecting the document weight.
   */
  [key: string]: number;
}

export interface QueryRankingExpressionWeights {
  /**
   * The query ranking expression (QRE).
   */
  expression: string;

  /**
   * The score added by the query ranking expression (QRE).
   */
  score: number;
}

export type TermWeightReport = Record<string, StemmedTermInformation>;

interface StemmedTermInformation {
  Weights: TermWeights | null;
  terms: Record<string, TermWeightsPerDocument>;
}

interface TermWeights {
  /**
   * The weight allocated when query terms have a special casing in the document.
   */
  Casing: number;

  /**
   * The weight allocated to the presence of query terms in the automatically populated '@concepts' field of the document.
   */
  Concept: number;

  /**
   * The weight allocated when query terms are formatted in the document (for example, heading level, bold, large, etc.).
   */
  Formatted: number;

  /**
   * The weight allocated based on the number of times query terms appear in the document.
   */
  Frequency: number;

  /**
   * The weight allocated when the document contains words with the same root as the query terms.
   *
   * @example
   * Searching for `programmer` will match documents with `programmer`, `programmers`, `program`, `programming`, etc.
   */
  Relation: number;

  /**
   * The weight allocated when the document summary contains query terms.
   */
  Summary: number;

  /**
   * The weight allocated when the document title contains query terms.
   */
  Title: number;

  /**
   * The weight allocated when the document URI contains query terms.
   */
  URI: number;

  /**
   * Custom factors affecting the term weight.
   */
  [key: string]: number;
}

interface TermWeightsPerDocument {
  /**
   * Captures the likelihood that query term expansions are related to the original query term. Documents containing highly correlated expansions are ranked higher than ones containing poorly correlated expansions.
   *
   * @example
   *
   * When you search for `universe`, because of the way the stemming algorithm works, the index expands the query using terms from the `univer` stem classes that can include `university`. When the terms `universe` and `university` rarely co-occur in your indexed items, items containing `university` are ranked lower.
   */
  Correlation: number;

  /**
   * The number of times a queried keyword appears in a given item, offset by the number of items in the index containing that keyword (see [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)).
   */
  'TF-IDF': number;
}

export const parseRankingInfo = (value: string) => {
  const REGEX_EXTRACT_DOCUMENT_WEIGHTS = /Document weights:\n((?:.)*?)\n+/g;
  const REGEX_EXTRACT_TERMS_WEIGHTS = /Terms weights:\n((?:.|\n)*)\n+/g;
  const REGEX_EXTRACT_TOTAL_WEIGHTS = /Total weight: ([0-9]+)/g;

  if (!value) {
    return null;
  }

  const docWeightsRegexResult = REGEX_EXTRACT_DOCUMENT_WEIGHTS.exec(value);
  const termsWeightRegexResult = REGEX_EXTRACT_TERMS_WEIGHTS.exec(value);
  const totalWeightRegexResult = REGEX_EXTRACT_TOTAL_WEIGHTS.exec(value);

  const qreWeights = parseQREWeights(value);
  const documentWeights = parseWeights<DocumentWeights>(
    docWeightsRegexResult ? docWeightsRegexResult[1] : null
  );
  const termsWeight = parseTermsWeights(termsWeightRegexResult);
  const totalWeight = totalWeightRegexResult
    ? Number(totalWeightRegexResult[1])
    : null;

  return {
    documentWeights,
    termsWeight,
    totalWeight,
    qreWeights,
  };
};

const parseWeights = <T extends Record<string, number>>(
  value: string | null
): T | null => {
  const REGEX_EXTRACT_LIST_OF_WEIGHTS = /(\w+(?:\s\w+)*): ([-0-9]+)/g;
  const REGEX_EXTRACT_WEIGHT_GROUP = /^(\w+(?:\s\w+)*): ([-0-9]+)$/;

  if (!value) {
    return null;
  }

  const listOfWeight = value.match(REGEX_EXTRACT_LIST_OF_WEIGHTS);

  if (!listOfWeight) {
    return null;
  }

  const weights: Record<string, number> = {};

  for (const weight of listOfWeight) {
    const weightGroup = weight.match(REGEX_EXTRACT_WEIGHT_GROUP);

    if (weightGroup) {
      const weightAppliedOn = weightGroup[1];
      const weightValue = weightGroup[2];
      weights[weightAppliedOn] = Number(weightValue);
    }
  }
  return weights as T;
};

const matchExec = (value: string, regex: RegExp) => {
  const results: string[][] = [];
  let arr: RegExpExecArray | null;
  while (true) {
    arr = regex.exec(value);
    if (arr === null) {
      break;
    }
    results.push(arr);
  }
  return results;
};

const parseTermsWeights = (
  termsWeight: RegExpExecArray | null
): TermWeightReport | null => {
  const REGEX_EXTRACT_GROUP_OF_TERMS =
    /((?:[^:]+: [0-9]+, [0-9]+; )+)\n((?:\w+: [0-9]+; )+)/g;
  const REGEX_EXTRACT_SINGLE_TERM = /([^:]+): ([0-9]+), ([0-9]+); /g;

  if (!termsWeight || !termsWeight[1]) {
    return null;
  }

  const listOfTerms = matchExec(termsWeight[1], REGEX_EXTRACT_GROUP_OF_TERMS);
  if (!listOfTerms) {
    return null;
  }
  const terms: TermWeightReport = {};
  for (const term of listOfTerms) {
    const listOfWords = matchExec(term[1], REGEX_EXTRACT_SINGLE_TERM);

    const words: Record<string, TermWeightsPerDocument> = {};
    for (const word of listOfWords) {
      words[word[1]] = {
        Correlation: Number(word[2]),
        'TF-IDF': Number(word[3]),
      };
    }

    const weights = parseWeights<TermWeights>(term[2]);
    terms[Object.keys(words).join(', ')] = {
      terms: words,
      Weights: weights,
    };
  }

  return terms;
};

const parseQREWeights = (value: string): QueryRankingExpressionWeights[] => {
  const REGEX_EXTRACT_QRE_WEIGHTS =
    /(Expression:\s".*")\sScore:\s(?!0)([-0-9]+)\n+/g;

  let qreWeightsRegexResult = REGEX_EXTRACT_QRE_WEIGHTS.exec(value);

  const qreWeights: QueryRankingExpressionWeights[] = [];
  while (qreWeightsRegexResult) {
    qreWeights.push({
      expression: qreWeightsRegexResult[1],
      score: parseInt(qreWeightsRegexResult[2], 10),
    });
    qreWeightsRegexResult = REGEX_EXTRACT_QRE_WEIGHTS.exec(value);
  }

  return qreWeights;
};
