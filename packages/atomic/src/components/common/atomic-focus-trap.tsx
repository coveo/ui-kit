import {Component, Element, Listen, Prop, Watch} from '@stencil/core';

function getParent(element: Element | ShadowRoot) {
  if (element.parentNode) {
    return element.parentNode as Element | ShadowRoot;
  }
  if (element instanceof ShadowRoot) {
    return element.host;
  }
  return null;
}

function contains(
  ancestor: Element | ShadowRoot,
  element: Element | ShadowRoot
): boolean {
  if (element === ancestor) {
    return true;
  }
  if (
    element instanceof HTMLElement &&
    element.assignedSlot &&
    contains(ancestor, element.assignedSlot)
  ) {
    return true;
  }
  const parent = getParent(element);
  return parent === null ? false : contains(ancestor, parent);
}

function getFirstFocusableDescendant(element: Element) {
  // Source: https://stackoverflow.com/a/30753870
  const focusableSelectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    '[tabindex]',
    '[contentEditable=true]',
  ].map((selector) => `${selector}:not([tabindex='-1'])`);
  return element.querySelector(
    focusableSelectors.join(',')
  ) as HTMLElement | null;
}

/**
 * @internal
 */
@Component({
  tag: 'atomic-focus-trap',
  shadow: false,
})
export class AtomicFocusTrap {
  @Element() private host!: HTMLElement;
  @Prop() public active = false;
  private readonly hiddenElements: Element[] = [];

  hide(element: Element) {
    if (element.hasAttribute('aria-hidden')) {
      return;
    }
    element.setAttribute('aria-hidden', 'true');
    this.hiddenElements.push(element);
  }

  showAll() {
    let el: Element | undefined;
    while ((el = this.hiddenElements.pop())) {
      el.removeAttribute('aria-hidden');
    }
  }

  isolate(element: Element | ShadowRoot) {
    const parent = getParent(element);
    if (parent === null) {
      return;
    }
    Array.from(parent.children as HTMLCollection).forEach((sibling) => {
      if (sibling === element) {
        return;
      }
      if (sibling.assignedSlot && contains(this.host, sibling.assignedSlot)) {
        return;
      }
      this.hide(sibling);
    });
    if (parent !== document.body) {
      this.isolate(parent);
    }
  }

  @Watch('active')
  activeChanged(active: boolean) {
    active ? this.isolate(this.host) : this.showAll();
  }

  @Listen('focusin', {target: 'document'})
  onFocusChanged(e: {originalTarget: HTMLElement}) {
    if (contains(this.host, e.originalTarget)) {
      return;
    }
    getFirstFocusableDescendant(this.host)?.focus();
  }

  connectedCallback() {
    this.activeChanged(this.active);
  }

  disconnectedCallback() {
    this.showAll();
  }
}
