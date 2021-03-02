/**
 * Returns a function that can be executed only once
 */
export function once<T extends unknown[]>(fn: (...args: T) => unknown) {
  let result: unknown;
  return function (this: unknown, ...args: T) {
    if (fn) {
      result = fn.apply(this, args);
      fn = () => {};
    }
    return result;
  };
}

export function camelToKebab(value: string) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function randomID(prepend?: string, length = 5) {
  return (
    prepend +
    Math.random()
      .toString(36)
      .substr(2, 2 + length)
  );
}

export function sanitize(string: string) {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, (match) => map[match]);
}

export function parseXML(string: string) {
  return new window.DOMParser().parseFromString(string, 'text/xml');
}
