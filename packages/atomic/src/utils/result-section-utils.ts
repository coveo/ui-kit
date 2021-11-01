import {containsVisualElement} from './utils';

const resultSectionTags = [
  'atomic-result-section-visual',
  'atomic-result-section-badges',
  'atomic-result-section-actions',
  'atomic-result-section-title',
  'atomic-result-section-title-metadata',
  'atomic-result-section-emphasized',
  'atomic-result-section-excerpt',
  'atomic-result-section-bottom-metadata',
];

export function containsSection(element: ParentNode) {
  return Array.from(element.children).some((child) =>
    resultSectionTags.includes(child.tagName.toLowerCase())
  );
}

export function hideEmptySection(element: HTMLElement) {
  element.style.display = containsVisualElement(element) ? '' : 'none';
}
