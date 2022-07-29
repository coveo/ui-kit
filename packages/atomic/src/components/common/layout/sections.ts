export const resultSectionTags = [
  'atomic-result-section-visual',
  'atomic-result-section-badges',
  'atomic-result-section-actions',
  'atomic-result-section-title',
  'atomic-result-section-title-metadata',
  'atomic-result-section-emphasized',
  'atomic-result-section-excerpt',
  'atomic-result-section-bottom-metadata',
] as const;

export function containsSections(content: string): boolean;
export function containsSections(content: HTMLCollection): boolean;

export function containsSections(content: string | HTMLCollection) {
  if (typeof content === 'string') {
    return resultSectionTags.some((resultSectionTag) =>
      content.includes(resultSectionTag)
    );
  }
  return Array.from(content).some((child) =>
    (resultSectionTags as readonly string[]).includes(
      child.tagName.toLowerCase()
    )
  );
}
