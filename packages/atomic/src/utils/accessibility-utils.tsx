/* eslint-disable @typescript-eslint/no-explicit-any */
import {buildCustomEvent} from './event-utils';
import {InitializableComponent} from './initialization-utils';
import {defer} from './utils';

export const findAriaLiveEventName = 'atomic/accessibility/findAriaLive';

export interface FindAriaLiveEventArgs {
  element?: HTMLAtomicAriaLiveElement;
}

export function AriaLiveRegion(regionName: string) {
  function dispatchMessage(message: string) {
    const event = buildCustomEvent<FindAriaLiveEventArgs>(
      findAriaLiveEventName,
      {}
    );
    document.dispatchEvent(event);
    const {element} = event.detail;
    if (element) {
      element.updateMessage(regionName, message);
    }
  }

  return (component: InitializableComponent, setterName: string) => {
    Object.defineProperty(component, setterName, {
      set: (message: string) => dispatchMessage(message),
    });
  };
}

export interface FocusTargetController {
  setTarget(element: HTMLElement | undefined): void;
  focusAfterSearch(): Promise<void>;
  focusOnNextTarget(): Promise<void>;
  disableForCurrentSearch(): void;
}

export function FocusTarget() {
  return (component: InitializableComponent, setterName: string) => {
    const {componentWillLoad} = component;

    component.componentWillLoad = function () {
      componentWillLoad && componentWillLoad.call(this);
      const {componentDidRender} = this;
      let focusAfterSearch = false;
      let focusOnNextTarget = false;
      let onFocusCallback: Function | null = null;
      let lastSearchId: string | undefined = undefined;
      let element: HTMLElement | undefined = undefined;

      this.componentDidRender = function () {
        componentDidRender && componentDidRender.call(this);
        if (!this.bindings) {
          return;
        }
        if (
          focusAfterSearch &&
          getSearchUIDFromState(this.bindings) !== lastSearchId
        ) {
          focusAfterSearch = false;
          if (element) {
            const el = element;
            // The focus seems to be flaky without deferring, especially on iOS.
            defer().then(() => {
              el.focus();
              onFocusCallback?.();
            });
          }
        }
      };

      const focusTargetController: FocusTargetController = {
        setTarget: (el) => {
          if (!el) {
            return;
          }
          element = el;
          if (focusOnNextTarget) {
            focusOnNextTarget = false;
            // The focus seems to be flaky without deferring, especially on iOS.
            defer().then(() => {
              el.focus();
              onFocusCallback?.();
            });
          }
        },
        focusAfterSearch: () => {
          lastSearchId = getSearchUIDFromState(this.bindings);
          focusAfterSearch = true;
          return new Promise((resolve) => (onFocusCallback = resolve));
        },
        focusOnNextTarget: () => {
          focusOnNextTarget = true;
          return new Promise((resolve) => (onFocusCallback = resolve));
        },
        disableForCurrentSearch: () =>
          getSearchUIDFromState(this.bindings) !== lastSearchId &&
          (focusAfterSearch = false),
      };
      this[setterName] = focusTargetController;
    };
  };
}

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

export function getFirstFocusableDescendant(
  element: Element
): HTMLElement | null {
  if (isFocusable(element)) {
    return element as HTMLElement;
  }
  let children = Array.from(element.children);
  if (element instanceof HTMLSlotElement) {
    children = element.assignedElements();
  } else if (element.shadowRoot) {
    children.push(...Array.from(element.shadowRoot.children));
  }
  for (const child of children) {
    const focusableDescendant = getFirstFocusableDescendant(child);
    if (focusableDescendant) {
      return focusableDescendant;
    }
  }
  return null;
}

function getSearchUIDFromState(bindings: any): string {
  // TODO: This is a temporary dirty hack while refactoring Atomic for generic use cases
  // Needs to be a generic function enforced at the interface level (BaseAtomicInterface)
  return bindings?.engine?.state?.search?.response?.searchUid;
}
