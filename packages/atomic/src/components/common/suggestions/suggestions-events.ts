import type {HTMLStencilElement} from '@stencil/core/internal';
import type {LitElement} from 'lit';
import {closest} from '../../../utils/dom-utils';
import {buildCustomEvent} from '../../../utils/event-utils';
import type {AnyBindings} from '../interface/bindings';
import type {SearchBoxSuggestionsEvent} from './suggestions-types';

/**
 * Dispatches an event which retrieves the `SearchBoxSuggestionsBindings` on a configured parent search box.
 *
 * @param event Event sent from the registered query suggestions to the parent search box
 * @param element Element on which to dispatch the event, which must be the child of a configured search box
 * @param allowedSearchBoxElements Optional array of allowed search box element selectors
 *
 * @throws Error if the element is not a child of an allowed search box element
 */
export const dispatchSearchBoxSuggestionsEvent = <
  SearchBoxController,
  Bindings = AnyBindings,
>(
  event: SearchBoxSuggestionsEvent<SearchBoxController, Bindings>,
  element: HTMLElement,
  allowedSearchBoxElements: readonly (typeof searchBoxElements)[number][] = searchBoxElements
) => {
  const interfaceElement = closest(element, searchBoxElements.join(', '));
  if (!interfaceElement) {
    throw new Error(
      `The "${element.nodeName.toLowerCase()}" component was not handled, as it is not a child of the following elements: ${allowedSearchBoxElements.join(
        ', '
      )}`
    );
  }
  void dispatchSearchBoxSuggestionsEventEventually(
    interfaceElement,
    element,
    event
  );
};

const searchBoxElements = [
  'atomic-search-box',
  'atomic-insight-search-box',
  'atomic-commerce-search-box',
] as const;

const isLitElementLoosely = (candidate: unknown): candidate is LitElement =>
  'updateComplete' in (candidate as LitElement) &&
  (candidate as LitElement).updateComplete instanceof Promise;

const dispatchSearchBoxSuggestionsEventEventually = async <
  SearchBoxController,
  Bindings = AnyBindings,
>(
  interfaceElement: Element,
  element: HTMLElement,
  event: SearchBoxSuggestionsEvent<SearchBoxController, Bindings>
) => {
  await customElements.whenDefined(interfaceElement.nodeName.toLowerCase());
  if (isLitElementLoosely(interfaceElement)) {
    await interfaceElement.updateComplete;
  } else if ('componentOnReady' in interfaceElement) {
    await (interfaceElement as HTMLStencilElement).componentOnReady();
  }
  element.dispatchEvent(
    buildCustomEvent('atomic/searchBoxSuggestion/register', event)
  );
};
