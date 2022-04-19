import {Component, Element, Listen, Prop, Watch} from '@stencil/core';
import {getFirstFocusableDescendant} from '../../utils/accessibility-utils';

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

  hideSiblingsRecursively(element: Element | ShadowRoot) {
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
      this.hideSiblingsRecursively(parent);
    }
  }

  @Watch('active')
  activeChanged(active: boolean) {
    active ? this.hideSiblingsRecursively(this.host) : this.showAll();
  }

  @Listen('focusin', {target: 'document'})
  onFocusChanged(e: FocusEvent) {
    if (!e.target || !this.active) {
      return;
    }

    if (contains(this.host, e.target as Element)) {
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
