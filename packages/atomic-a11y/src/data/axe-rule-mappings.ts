export function extractCriteriaFromTags(tags: readonly string[]): string[] {
  const criterionTagPattern = /^wcag(\d)(\d)(\d{1,2})$/;

  return tags
    .map((tag) => tag.match(criterionTagPattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => `${match[1]}.${match[2]}.${match[3]}`);
}
