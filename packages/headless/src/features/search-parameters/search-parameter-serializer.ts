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
    .map((part) => part.split('='))
    .filter(isValidPair)
    .map(cast);

  return keyValuePairs.reduce((acc, pair) => {
    const [key, val] = pair;
    return {...acc, [key]: val};
  }, {});
}

function isValidPair<K extends keyof SearchParameters>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

function isValidKey(key: string): key is keyof SearchParameters {
  const validKeys: (keyof SearchParameters)[] = ['q', 'enableQuerySyntax'];
  return validKeys.some((validKey) => validKey === key);
}

function cast<K extends keyof SearchParameters>(
  pair: [K, string]
): [K, unknown] {
  const [key, value] = pair;

  if (key === 'q') {
    return [key, value];
  }

  if (key === 'enableQuerySyntax') {
    return [key, value === 'true'];
  }

  return pair;
}
