export function regexEncode(value: string): string {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480/
export function encodeForDomAttribute(str: string) {
  return str
    .split('')
    .map((ch) => (ch.match(/(\d|\w)+/g) ? ch : ch.charCodeAt(0)))
    .join('');
}
