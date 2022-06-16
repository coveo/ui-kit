import {Component, Element, Listen, Prop, Watch} from '@stencil/core';
import {getFirstFocusableDescendant} from '../../utils/accessibility-utils';
import {defer, getFocusedElement} from '../../utils/utils';

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
  /**
   * The source to focus when the focus trap becomes inactive.
   */
  @Prop({mutable: true}) source?: HTMLElement;
  /**
   * The container to hide from the tabindex and accessibility DOM when the focus trap is inactive.
   */
  @Prop({mutable: true}) container?: HTMLElement;
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

  showSelf() {
    this.parentToHide.removeAttribute('aria-hidden');
    this.parentToHide.removeAttribute('tabindex');
  }

  hideSelf() {
    this.parentToHide.setAttribute('aria-hidden', 'true');
    this.parentToHide.setAttribute('tabindex', '-1');
  }

  @Watch('active')
  async activeChanged(active: boolean, wasActive: boolean) {
    const isInitialLoad = active === wasActive;
    if (active) {
      this.showSelf();
      if (!isInitialLoad) {
        await defer();
        getFirstFocusableDescendant(this.host)?.focus();
      }
      this.hideSiblingsRecursively(this.host);
    } else {
      this.showAll();
      if (!isInitialLoad) {
        await defer();
        this.source?.focus();
      }
      this.hideSelf();
    }
  }

  @Listen('focusin', {target: 'document'})
  onFocusChanged(e: FocusEvent) {
    if (!e.target || !this.active) {
      return;
    }

    const focusedElement = getFocusedElement();

    if (focusedElement && contains(this.host, focusedElement)) {
      return;
    }

    getFirstFocusableDescendant(this.host)?.focus();
  }

  async connectedCallback() {
    this.activeChanged(this.active, this.active);
  }

  disconnectedCallback() {
    this.showAll();
  }

  private get parentToHide() {
    return this.container ?? this.host;
  }
}
