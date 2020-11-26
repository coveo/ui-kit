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

function deserialize(fragment: string): Record<string, string> {
  const parts = fragment.split('&').filter((part) => part.length);
  const keyValuePairs = parts.map((part) => part.split('='));

  return keyValuePairs.reduce((acc, pair) => {
    const [key, val] = pair;
    return {...acc, [key]: val};
  }, {});
}
