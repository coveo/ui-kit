import {isElementNode} from '../../../utils/utils';

export const resultSectionTags = new Set([
  'atomic-result-section-visual',
  'atomic-result-section-badges',
  'atomic-result-section-actions',
  'atomic-result-section-title',
  'atomic-result-section-title-metadata',
  'atomic-result-section-emphasized',
  'atomic-result-section-excerpt',
  'atomic-result-section-bottom-metadata',
] as const);

type SetValueType<T> = T extends Set<infer U> ? U : never;

export type ResultSectionTagName = SetValueType<typeof resultSectionTags>;

export function isResultSectionNode(element: Node) {
  if (!isElementNode(element)) {
    return false;
  }
  return resultSectionTags.has(
    element.tagName.toLowerCase() as ResultSectionTagName
  );
}

export function containsSections(content: string | NodeList | HTMLCollection) {
  if (typeof content === 'string') {
    return Array.from(resultSectionTags.values()).some((resultSectionTag) =>
      content.includes(resultSectionTag)
    );
  }
  return Array.from(content).some((child) => isResultSectionNode(child));
}
