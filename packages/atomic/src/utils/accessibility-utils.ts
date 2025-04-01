// import {AnyBindings} from '../components/common/interface/bindings';
// import {buildCustomEvent} from './event-utils';
// import {InitializableComponent} from './initialization-utils';
// import {defer} from './utils';

// const findAriaLiveEventName = 'atomic/accessibility/findAriaLive';

//TODO: Reimplement to fit Lit
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FindAriaLiveEventArgs {
  // element?: HTMLAtomicAriaLiveElement;
}

//TODO: Reimplement to fit Lit
export function AriaLiveRegion(_regionName: string, _assertive = false) {}

//TODO: Reimplement to fit Lit
export class FocusTargetController {}

function isFocusable(element: Element) {
  // Source: https://stackoverflow.com/a/30753870
  if (element.getAttribute('tabindex') === '-1') {
    return false;
  }
  if (element.hasAttribute('tabindex')) {
    return true;
  }
  if (element.getAttribute('contentEditable') === 'true') {
    return true;
  }
  switch (element.tagName) {
    case 'A':
    case 'AREA':
      return element.hasAttribute('href');
    case 'INPUT':
    case 'SELECT':
    case 'TEXTAREA':
    case 'BUTTON':
      return !element.hasAttribute('disabled');
    case 'IFRAME':
      return true;
    default:
      return false;
  }
}

export function* getFocusableDescendants(
  element: Element
): Generator<HTMLElement> {
  if (isFocusable(element)) {
    yield element as HTMLElement;
  }
  let children = Array.from(element.children);
  if (element instanceof HTMLSlotElement) {
    children = element.assignedElements();
  } else if (element.shadowRoot) {
    children.push(...Array.from(element.shadowRoot.children));
  }
  for (const child of children) {
    yield* getFocusableDescendants(child);
  }
}

export function getFirstFocusableDescendant(
  element: Element
): HTMLElement | null {
  return getFocusableDescendants(element).next().value ?? null;
}
