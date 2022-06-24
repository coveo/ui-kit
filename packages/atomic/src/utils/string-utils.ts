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

// https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
export function hashString(str: string) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) {
    return hash;
  }
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    // hash |= 0; // Convert to 32bit integer
  }
  return JSON.stringify(hash);
}
