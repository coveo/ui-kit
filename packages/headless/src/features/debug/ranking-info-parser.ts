type ListOfTermsWeights = Record<string, WeightsPerTerm>;

export interface Ranking {
  /**
   * The attributes of the document that contributed to its ranking.
   * */
  documentWeights: DocumentWeights | null;

  /**
   * The weight attributed to each term in the query.
   */
  termsWeight: Record<string, WeightsPerTerm> | null;

  /**
   * The sum of all weights.
   */
  totalWeight: number | null;

  /**
   * The weights applied by query ranking expressions.
   */
  qreWeights: ListOfQRE[];
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
   * The custom weight assigned through an [indexing pipeline extension (IPE)](https://docs.coveo.com/en/206/) for the item.
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
   * The presence of queried keywords in the title of the item.
   */
  Title: number;

  /**
   * Custom factors affecting the document weight.
   */
  [key: string]: number;
}

export interface ListOfQRE {
  expression: string;
  score: number;
}

export interface WeightsPerTerm {
  Weights: WeightsPerTermBreakdown;
  terms: Record<string, WeightsPerTermPerDocument>;
}

export interface WeightsPerTermBreakdown {
  Casing: number;
  Concept: number;
  Formatted: number;
  Frequency: number;
  Relation: number;
  Summary: number;
  Title: number;
  URI: number;
  [key: string]: number;
}

export interface WeightsPerTermPerDocument {
  Correlation: number;
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
): ListOfTermsWeights | null => {
  const REGEX_EXTRACT_GROUP_OF_TERMS = /((?:[^:]+: [0-9]+, [0-9]+; )+)\n((?:\w+: [0-9]+; )+)/g;
  const REGEX_EXTRACT_SINGLE_TERM = /([^:]+): ([0-9]+), ([0-9]+); /g;

  if (!termsWeight || !termsWeight[1]) {
    return null;
  }

  const listOfTerms = matchExec(termsWeight[1], REGEX_EXTRACT_GROUP_OF_TERMS);
  if (!listOfTerms) {
    return null;
  }
  const terms = {} as ListOfTermsWeights;
  for (const term of listOfTerms) {
    const listOfWords = matchExec(term[1], REGEX_EXTRACT_SINGLE_TERM);

    const words = {} as Record<string, WeightsPerTermPerDocument>;
    for (const word of listOfWords) {
      words[word[1]] = {
        Correlation: Number(word[2]),
        'TF-IDF': Number(word[3]),
      };
    }

    const weights = parseWeights(term[2]);
    terms[Object.keys(words).join(', ')] = {
      terms: words,
      Weights: (weights as unknown) as WeightsPerTermBreakdown,
    };
  }

  return terms;
};

const parseQREWeights = (value: string): ListOfQRE[] => {
  const REGEX_EXTRACT_QRE_WEIGHTS = /(Expression:\s".*")\sScore:\s(?!0)([0-9]+)\n+/g;

  let qreWeightsRegexResult = REGEX_EXTRACT_QRE_WEIGHTS.exec(value);

  const qreWeights: ListOfQRE[] = [];
  while (qreWeightsRegexResult) {
    qreWeights.push({
      expression: qreWeightsRegexResult[1],
      score: parseInt(qreWeightsRegexResult[2], 10),
    });
    qreWeightsRegexResult = REGEX_EXTRACT_QRE_WEIGHTS.exec(value);
  }

  return qreWeights;
};
