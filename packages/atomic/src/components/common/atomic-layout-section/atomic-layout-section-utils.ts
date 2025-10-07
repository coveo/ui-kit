import type {AtomicLayoutSection} from './atomic-layout-section';

export type Section =
  | 'search'
  | 'facets'
  | 'main'
  | 'status'
  | 'results'
  | 'horizontal-facets'
  | 'products'
  | 'pagination';

export function findSection(element: HTMLElement, section: Section) {
  return element.querySelector(
    sectionSelector(section)
  ) as AtomicLayoutSection | null;
}

export function sectionSelector(section: Section) {
  return `atomic-layout-section[section="${section}"]`;
}
