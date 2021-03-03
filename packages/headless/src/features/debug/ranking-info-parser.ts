type ListOfTermsWeights = Record<string, WeightsPerTerm>;

export type RankingInfo = ReturnType<typeof parseRankingInfo>;

export interface ListOfWeights {
  Adjacency: number;
  'Collaborative rating': number;
  Custom: number;
  Date: number;
  QRE: number;
  Quality: number;
  'Ranking functions': number;
  Source: number;
  Title: number;
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

const parseWeights = (value: string | null): ListOfWeights | null => {
  const REGEX_EXTRACT_LIST_OF_WEIGHTS = /(\w+(?:\s\w+)*): ([-0-9]+)/g;
  const REGEX_EXTRACT_WEIGHT_GROUP = /^(\w+(?:\s\w+)*): ([-0-9]+)$/;

  if (!value) {
    return null;
  }

  const listOfWeight = value.match(REGEX_EXTRACT_LIST_OF_WEIGHTS);

  if (!listOfWeight) {
    return null;
  }

  const weights = {} as ListOfWeights;

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
