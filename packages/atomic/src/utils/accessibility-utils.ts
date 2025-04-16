import {ReactiveController, ReactiveControllerHost} from 'lit';
import {buildCustomEvent} from './event-utils';

export interface FindAriaLiveEventArgs {
  element?: HTMLAtomicAriaLiveElement;
}

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

  public dispatchMessage(message: string) {
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

//TODO: Reimplement to fit Lit
export class FocusTargetController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setTarget(_el: HTMLElement) {}
  public focusAfterSearch() {}
  public focusOnNextTarget() {}
  public async focus() {}
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
