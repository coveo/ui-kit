import {Component, Element, Listen, Prop, Watch} from '@stencil/core';
import {getFirstFocusableDescendant} from '../../utils/stencil-accessibility-utils';
import {
  isAncestorOf,
  defer,
  getFocusedElement,
  getParent,
} from '../../utils/utils';

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

  /**
   * Whether the element should be hidden from screen readers & not interactive with the tab, when not active.
   */
  @Prop() shouldHideSelf = true;

  /**
   * The common ancestor of the focus trap and of all the elements that should be inaccessible when inside the focus trap.
   */
  @Prop() scope = document.body;

  private readonly hiddenElements: Element[] = [];

  hide(element: Element) {
    // aria-hidden -> already hidden
    // aria-live or atomic-aria-live -> must not be hidden otherwise it won't announce dynamic changes in the live region
    if (
      element.hasAttribute('aria-hidden') ||
      element.hasAttribute('aria-live') ||
      element.tagName.toLowerCase() === 'atomic-aria-live'
    ) {
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
      if (
        sibling.assignedSlot &&
        isAncestorOf(this.host, sibling.assignedSlot)
      ) {
        return;
      }
      this.hide(sibling);
    });
    if (parent !== this.scope) {
      this.hideSiblingsRecursively(parent);
    }
  }

  showSelf() {
    this.parentToHide.removeAttribute('aria-hidden');
    this.parentToHide.removeAttribute('tabindex');
  }

  hideSelf() {
    if (this.shouldHideSelf) {
      this.parentToHide.setAttribute('aria-hidden', 'true');
      this.parentToHide.setAttribute('tabindex', '-1');
    }
  }

  async onDeactivated(isInitialLoad: boolean) {
    this.showAll();
    if (!isInitialLoad) {
      await defer();
      this.source?.focus();
    }
    this.hideSelf();
  }

  async onActivated(isInitialLoad: boolean) {
    this.showSelf();
    if (!isInitialLoad) {
      await defer();
      getFirstFocusableDescendant(this.host)?.focus();
    }
    this.hideSiblingsRecursively(this.host);
  }

  @Watch('active')
  async activeChanged(active: boolean, wasActive: boolean) {
    const isInitialLoad = active === wasActive;
    if (active) {
      await this.onActivated(isInitialLoad);
    } else {
      await this.onDeactivated(isInitialLoad);
    }
  }

  @Listen('focusin', {target: 'document'})
  onFocusChanged(e: FocusEvent) {
    const elementIsPartOfHost = (focusedElement: Element | ShadowRoot) =>
      isAncestorOf(this.host, focusedElement);

    const elementIsPartOfScope = (focusedElement: Element | ShadowRoot) =>
      isAncestorOf(this.scope, focusedElement);

    if (!e.target || !this.active) {
      return;
    }

    const focusedElement = getFocusedElement();

    if (
      focusedElement &&
      (elementIsPartOfHost(focusedElement) ||
        !elementIsPartOfScope(focusedElement))
    ) {
      return;
    }

    getFirstFocusableDescendant(this.host)?.focus();
  }

  connectedCallback() {
    this.activeChanged(this.active, this.active);
  }

  disconnectedCallback() {
    this.showAll();
  }

  private get parentToHide() {
    return this.container ?? this.host;
  }
}
