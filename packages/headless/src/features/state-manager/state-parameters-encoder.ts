import {StateParameters} from './state-manager-actions';

export function encodeStateParameters(obj: StateParameters) {
  const fragment = Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  return fragment;
}

export function decodeStateParameters(
  fragment: string
): Record<string, string> {
  const parts = fragment.split('&').filter((part) => part.length);
  const keyValuePairs = parts.map((part) => part.split('='));

  return keyValuePairs.reduce((acc, pair) => {
    const [key, val] = pair;
    return {...acc, [key]: val};
  }, {});
}
