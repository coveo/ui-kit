import {containsVisualElement} from './utils';

export function hideEmptySection(element: HTMLElement) {
  console.log('change in /utils');
  element.style.display = containsVisualElement(element) ? '' : 'none';
}
