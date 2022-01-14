export function mapToHTMLProperties(
  prefix: string,
  map: Record<string, string[]>
) {
  return Object.entries(map).map(([key, values]) => {
    return [
      `${prefix}-${key.toLowerCase()}`,
      `${values.map((v) => v.replace(/'/g, `"`)).join(',')}`,
    ];
  });
}
