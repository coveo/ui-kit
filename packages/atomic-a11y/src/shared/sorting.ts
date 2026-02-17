export function compareByNumericId(a: string, b: string): number {
  return a.localeCompare(b, 'en-US', {numeric: true});
}

export function compareByName(a: string, b: string): number {
  return a.localeCompare(b, 'en-US');
}
