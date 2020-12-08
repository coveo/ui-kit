import {SearchParameters} from './search-parameter-actions';

export function buildSearchParameterSerializer() {
  return {serialize, deserialize};
}

function serialize(obj: SearchParameters) {
  const fragment = Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  return fragment;
}

function deserialize(fragment: string): SearchParameters {
  const parts = fragment.split('&').filter((part) => part.length);
  const keyValuePairs = parts
    .map((part) => splitOnFirstDelimiter(part))
    .filter(isValidPair)
    .map(cast);

  return keyValuePairs.reduce((acc, pair) => {
    const [key, val] = pair;
    return {...acc, [key]: val};
  }, {});
}

function splitOnFirstDelimiter(str: string) {
  const delimiter = '=';
  const [first, ...rest] = str.split(delimiter);
  const second = rest.join(delimiter);

  return [first, second];
}

function isValidPair<K extends keyof SearchParameters>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

function isValidKey(key: string): key is keyof SearchParameters {
  const supportedParameters: Record<
    keyof Required<SearchParameters>,
    boolean
  > = {
    q: true,
    aq: true,
    cq: true,
    enableQuerySyntax: true,
    firstResult: true,
    numberOfResults: true,
    sortCriteria: true,
    debug: true,
  };

  return key in supportedParameters;
}

function cast<K extends keyof SearchParameters>(
  pair: [K, string]
): [K, unknown] {
  const [key, value] = pair;

  if (key === 'enableQuerySyntax') {
    return [key, value === 'true'];
  }

  if (key === 'debug') {
    return [key, value === 'true'];
  }

  if (key === 'firstResult') {
    return [key, parseInt(value)];
  }

  if (key === 'numberOfResults') {
    return [key, parseInt(value)];
  }

  return pair;
}
