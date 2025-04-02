export function regexEncode(value: string): string {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

export function encodeForDomAttribute(str: string) {
  return str
    .split('')
    .map((ch) => (ch.match(/(\d|\w)+/g) ? ch : ch.charCodeAt(0)))
    .join('');
}
