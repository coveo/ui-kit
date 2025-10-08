import {isElementNode} from '@/src/utils/utils';

const resultSectionTags = new Set([
  'atomic-result-section-visual',
  'atomic-result-section-badges',
  'atomic-result-section-actions',
  'atomic-result-section-title',
  'atomic-result-section-title-metadata',
  'atomic-result-section-emphasized',
  'atomic-result-section-excerpt',
  'atomic-result-section-bottom-metadata',
  'atomic-result-section-children',
] as const);

const productSectionTags = new Set([
  'atomic-product-section-visual',
  'atomic-product-section-badges',
  'atomic-product-section-actions',
  'atomic-product-section-name',
  'atomic-product-section-metadata',
  'atomic-product-section-emphasized',
  'atomic-product-section-description',
  'atomic-product-section-bottom-metadata',
  'atomic-product-section-children',
] as const);

const allTags = new Set([...resultSectionTags, ...productSectionTags]);

type SetValueType<T> = T extends Set<infer U> ? U : never;

export type ItemSectionTagName = SetValueType<typeof allTags>;

export function isResultSectionNode(element: Node) {
  if (!isElementNode(element)) {
    return false;
  }
  return allTags.has(element.tagName.toLowerCase() as ItemSectionTagName);
}

export function containsSections(content: string | NodeList | HTMLCollection) {
  if (typeof content === 'string') {
    return Array.from(allTags.values()).some((tag) => content.includes(tag));
  }
  return Array.from(content).some((child) => isResultSectionNode(child));
}
