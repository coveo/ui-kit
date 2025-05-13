import {ReactiveController, ReactiveControllerHost} from 'lit';
import {AnyBindings} from '../components';
import {buildCustomEvent} from './event-utils';
import {defer} from './utils';

export interface FindAriaLiveEventArgs {
  element?: HTMLAtomicAriaLiveElement;
}

export class AriaLiveRegionController implements ReactiveController {
  private host: ReactiveControllerHost;
  private regionName: string;
  private assertive: boolean;

  constructor(
    host: ReactiveControllerHost,
    regionName: string,
    assertive = false
  ) {
    this.host = host;
    this.regionName = regionName;
    this.assertive = assertive;

    this.host.addController(this);
  }

  private getAriaLiveElement() {
    const event = buildCustomEvent<FindAriaLiveEventArgs>(
      'atomic/accessibility/findAriaLive',
      {}
    );
    document.dispatchEvent(event);
    const {element} = event.detail;
    return element;
  }

  private dispatchMessage(message: string) {
    this.getAriaLiveElement()?.updateMessage(
      this.regionName,
      message,
      this.assertive
    );
  }

  set message(msg: string) {
    this.dispatchMessage(msg);
  }

  hostUpdate() {
    this.getAriaLiveElement()?.registerRegion(this.regionName, this.assertive);
  }
}

export class FocusTargetController implements ReactiveController {
  private bindings: AnyBindings;
  private lastSearchId?: string;
  private element?: HTMLElement;
  private onFocusCallback?: Function;
  private doFocusAfterSearch = false;
  private doFocusOnNextTarget = false;

  constructor(
    private host: ReactiveControllerHost,
    bindings: AnyBindings
  ) {
    this.host = host;
    this.bindings = bindings;
    this.host.addController(this);
  }

  public setTarget(el?: HTMLElement) {
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

  hostUpdated() {
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
