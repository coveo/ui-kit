export function encodeToUrlFragment(obj: Record<string, string>) {
  const fragment = Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  return fragment;
}

export function decodeUrlFragment(fragment: string): Record<string, string> {
  const parts = fragment.split('&');
  const keyValuePairs = parts.map((part) => part.split('='));

  return keyValuePairs.reduce((acc, pair) => {
    const [key, val] = pair;
    return {...acc, [key]: val};
  }, {});
}
