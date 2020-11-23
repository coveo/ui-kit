export function encodeToUrlFragment(obj: Record<string, unknown>) {
  const fragment = Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .reduce((acc, current) => acc + current, '');

  return fragment;
}

export function decodeUrlFragment(fragment: string) {
  const parts = fragment.split('=');
  if (parts.length !== 2) {
    return {};
  }
  const [key, val] = parts;
  return {[key]: val};
}
