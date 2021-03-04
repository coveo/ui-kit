export interface Ranking {
  /**
   * The attributes of the document that contributed to its ranking.
   * */
  documentWeights: DocumentWeights | null;

  /**
   * The weight attributed to each term in the query.
   */
  termsWeight: TermWeightDictionary | null;

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
   * The effect of proximity of query terms. More weight is given to documents having the terms closer together.
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
   * The weight applied by a [query ranking expression (QRE)](https://docs.coveo.com/en/2777/coveo-solutions/using-query-ranking-expressions).
   */
  QRE: number;

  /**
   * The proximity of the document in the remaining results after filtering indexed items by query terms and user permissions.
   * See [item weighting](https://docs.coveo.com/en/1624/searching-with-coveo/understanding-search-result-ranking#phase-2-item-weighting) for more information.
   */
  Quality: number;

  /**
   * The weight applied by a [ranking function](https://docs.coveo.com/en/1448/build-a-search-ui/ranking-functions).
   */
  'Ranking functions': number;

  /**
   * The effect of the reputation of the document source on the ranking.
   */
  Source: number;

  /**
   * The presence of query terms in the document title.
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

export type TermWeightDictionary = Record<string, TermWeightInformation>;

interface TermWeightInformation {
  Weights: TermWeights;
  terms: Record<string, TermWeightsPerDocument>;
}

interface TermWeights {
  /**
   * Whether query terms have a special casing in the document.
   */
  Casing: number;

  /**
   * The presence of query terms in the automatically populated '@concepts' field of the document.
   */
  Concept: number;

  /**
   * Whether query terms are formatted in the document (e.g., heading level, bold, large, etc.).
   */
  Formatted: number;

  /**
   * The number of times query terms appear in the document.
   */
  Frequency: number;

  /**
   * The presence of words in the document with the same root as the query terms.
   *
   * @example
   * Searching for `programmer` will match documents with `programmer`, `programmers`, `program`, `programming`, etc.
   */
  Relation: number;

  /**
   * The presence of query terms in the document summary.
   */
  Summary: number;

  /**
   * The presence of query terms in the document title.
   */
  Title: number;

  /**
   * The presence of query terms in the document URI.
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
  const totalWeigthRegexResult = REGEX_EXTRACT_TOTAL_WEIGHTS.exec(value);

  const qreWeights = parseQREWeights(value);
  const documentWeights = parseWeights(
    docWeightsRegexResult ? docWeightsRegexResult[1] : null
  );
  const termsWeight = parseTermsWeights(termsWeightRegexResult);
  const totalWeight = totalWeigthRegexResult
    ? Number(totalWeigthRegexResult[1])
    : null;

  return {
    documentWeights,
    termsWeight,
    totalWeight,
    qreWeights,
  };
};

const parseWeights = (value: string | null): DocumentWeights | null => {
  const REGEX_EXTRACT_LIST_OF_WEIGHTS = /(\w+(?:\s\w+)*): ([-0-9]+)/g;
  const REGEX_EXTRACT_WEIGHT_GROUP = /^(\w+(?:\s\w+)*): ([-0-9]+)$/;

  if (!value) {
    return null;
  }

  const listOfWeight = value.match(REGEX_EXTRACT_LIST_OF_WEIGHTS);

  if (!listOfWeight) {
    return null;
  }

  const weights = {} as DocumentWeights;

  for (const weight of listOfWeight) {
    const weightGroup = weight.match(REGEX_EXTRACT_WEIGHT_GROUP);

    if (weightGroup) {
      const weightAppliedOn = weightGroup[1];
      const weightValue = weightGroup[2];
      weights[weightAppliedOn] = Number(weightValue);
    }
  }
  return weights;
};

const matchExec = (value: string, regex: RegExp) => {
  const results: string[][] = [];
  let arr: RegExpExecArray | null;
  while ((arr = regex.exec(value)) !== null) {
    results.push(arr);
  }
  return results;
};

const parseTermsWeights = (
  termsWeight: RegExpExecArray | null
): TermWeightDictionary | null => {
  const REGEX_EXTRACT_GROUP_OF_TERMS = /((?:[^:]+: [0-9]+, [0-9]+; )+)\n((?:\w+: [0-9]+; )+)/g;
  const REGEX_EXTRACT_SINGLE_TERM = /([^:]+): ([0-9]+), ([0-9]+); /g;

  if (!termsWeight || !termsWeight[1]) {
    return null;
  }

  const listOfTerms = matchExec(termsWeight[1], REGEX_EXTRACT_GROUP_OF_TERMS);
  if (!listOfTerms) {
    return null;
  }
  const terms = {} as TermWeightDictionary;
  for (const term of listOfTerms) {
    const listOfWords = matchExec(term[1], REGEX_EXTRACT_SINGLE_TERM);

    const words = {} as Record<string, TermWeightsPerDocument>;
    for (const word of listOfWords) {
      words[word[1]] = {
        Correlation: Number(word[2]),
        'TF-IDF': Number(word[3]),
      };
    }

    const weights = parseWeights(term[2]);
    terms[Object.keys(words).join(', ')] = {
      terms: words,
      Weights: (weights as unknown) as TermWeights,
    };
  }

  return terms;
};

const parseQREWeights = (value: string): QueryRankingExpressionWeights[] => {
  const REGEX_EXTRACT_QRE_WEIGHTS = /(Expression:\s".*")\sScore:\s(?!0)([0-9]+)\n+/g;

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
