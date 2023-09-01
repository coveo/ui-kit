/* eslint-disable @typescript-eslint/no-explicit-any */
import {AnyBindings} from '../components/common/interface/bindings';
import {buildCustomEvent} from './event-utils';
import {InitializableComponent} from './initialization-utils';
import {defer} from './utils';

export const findAriaLiveEventName = 'atomic/accessibility/findAriaLive';

export interface FindAriaLiveEventArgs {
  element?: HTMLAtomicAriaLiveElement;
}

export function AriaLiveRegion(regionName: string, assertive = false) {
  function getAriaLiveElement() {
    const event = buildCustomEvent<FindAriaLiveEventArgs>(
      findAriaLiveEventName,
      {}
    );
    document.dispatchEvent(event);
    const {element} = event.detail;
    return element;
  }

  function dispatchMessage(message: string) {
    getAriaLiveElement()?.updateMessage(regionName, message, assertive);
  }

  function registerRegion() {
    getAriaLiveElement()?.registerRegion(regionName, assertive);
  }

  return (
    component: InitializableComponent<AnyBindings>,
    setterName: string
  ) => {
    const {componentWillRender} = component;
    Object.defineProperty(component, setterName, {
      set: (message: string) => dispatchMessage(message),
    });

    component.componentWillRender = function () {
      componentWillRender && componentWillRender.call(this);
      registerRegion();
    };
  };
}

export class FocusTargetController {
  private bindings: AnyBindings;
  private lastSearchId?: string;
  private element?: HTMLElement;
  private onFocusCallback?: Function;
  private doFocusAfterSearch = false;
  private doFocusOnNextTarget = false;

  constructor(private component: InitializableComponent<AnyBindings>) {
    this.bindings = component.bindings;
    this.handleComponentRenderLoop();
  }

  public setTarget(el: HTMLElement | undefined) {
    if (!el) {
      return;
    }
    this.element = el;
    if (this.doFocusOnNextTarget) {
      this.doFocusOnNextTarget = false;
      this.focus();
    }
  }

  public async focus() {
    await defer();
    this.element?.focus();
    this.onFocusCallback?.();
  }

  public focusAfterSearch() {
    this.lastSearchId = this.bindings.store.getUniqueIDFromEngine(
      this.bindings.engine
    );
    this.doFocusAfterSearch = true;
    return new Promise((resolve) => (this.onFocusCallback = resolve));
  }

  public focusOnNextTarget() {
    this.doFocusOnNextTarget = true;
    return new Promise((resolve) => (this.onFocusCallback = resolve));
  }

  public disableForCurrentSearch() {
    if (
      this.bindings.store.getUniqueIDFromEngine(this.bindings.engine) !==
      this.lastSearchId
    ) {
      this.doFocusAfterSearch = false;
    }
  }

  private handleComponentRenderLoop() {
    const originalComponentDidRender = this.component.componentDidRender;

    this.component.componentDidRender = () => {
      originalComponentDidRender &&
        originalComponentDidRender.call(this.component);
      if (!this.bindings) {
        return;
      }
      if (
        this.doFocusAfterSearch &&
        this.bindings.store.getUniqueIDFromEngine(this.bindings.engine) !==
          this.lastSearchId
      ) {
        this.doFocusAfterSearch = false;
        if (this.element) {
          const el = this.element;
          // The focus seems to be flaky without deferring, especially on iOS.
          defer().then(() => {
            el.focus();
            this.onFocusCallback?.();
          });
        }
      }
    };
  }
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
