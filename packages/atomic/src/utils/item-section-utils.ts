import {containsVisualElement} from './dom-utils';

export function hideEmptySection(element: HTMLElement) {
  element.style.display = containsVisualElement(element) ? '' : 'none';
}
