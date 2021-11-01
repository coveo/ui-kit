import {ResultDisplayImageSize} from '../components/atomic-result/atomic-result-display-options';

const resultSectionTags = [
  'atomic-result-section-visual',
  'atomic-result-section-badges',
  'atomic-result-section-actions',
  'atomic-result-section-title',
  'atomic-result-section-title-metadata',
  'atomic-result-section-emphasized',
  'atomic-result-section-excerpt',
  'atomic-result-section-bottom-metadata',
] as const;

export function containsSection(element: ParentNode) {
  return Array.from(element.children).some((child) =>
    (resultSectionTags as readonly string[]).includes(
      child.tagName.toLowerCase()
    )
  );
}

function getSection(
  template: ParentNode,
  section: typeof resultSectionTags[number]
) {
  return Array.from(template.children).find(
    (element) => element.tagName.toLowerCase() === section
  );
}

export function getImageSize(template: ParentNode) {
  return (getSection(template, 'atomic-result-section-visual')?.getAttribute(
    'image-size'
  ) ?? undefined) as ResultDisplayImageSize | undefined;
}
