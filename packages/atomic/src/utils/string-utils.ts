export function regexEncode(value: string): string {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

export function cleanUpString(str: string) {
  return str
    .match(/(\d|\w|\s)+/g)
    ?.join('')
    .replace(/\s/g, '-')
    .toLocaleLowerCase();
}
