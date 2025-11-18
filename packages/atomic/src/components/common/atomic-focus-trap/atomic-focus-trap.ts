import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {watch} from '@/src/decorators/watch';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {getFirstFocusableDescendant} from '@/src/utils/accessibility-utils';
import {
  defer,
  getFocusedElement,
  getParent,
  isAncestorOf,
} from '@/src/utils/utils';

/**
 * The `atomic-focus-trap` component manages focus within a modal or dialog,
 * ensuring keyboard navigation stays within the trap when active. When active,
 * it hides sibling elements from assistive technologies and restricts tab focus
 * to its descendants.
 */
@customElement('atomic-focus-trap')
export class AtomicFocusTrap extends LightDomMixin(LitElement) {
  /**
   * Whether the focus trap is active.
   */
  @property({type: Boolean, converter: booleanConverter}) active = false;

  /**
   * The source element to focus when the focus trap becomes inactive.
   */
  @property({type: Object}) source?: HTMLElement;

  /**
   * The container to hide (instead of the focus trap element itself) from the tabindex and accessibility DOM
   * when the focus trap becomes inactive and `shouldHideSelf` is true.
   */
  @property({type: Object}) container?: HTMLElement;

  /**
   * Whether the element should be hidden from screen readers & not interactive with the tab, when not active.
   */
  @property({
    type: Boolean,
    attribute: 'should-hide-self',
    converter: booleanConverter,
  })
  shouldHideSelf = true;

  /**
   * The common ancestor of the focus trap and of all the elements that should be inaccessible when inside the focus trap.
   */
  @property({type: Object}) scope: Element = document.body;

  private readonly hiddenElements: Element[] = [];

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('focusin', this.onFocusChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.showAll();
    document.removeEventListener('focusin', this.onFocusChanged);
  }

  private hide(element: Element) {
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

  private showAll() {
    let el: Element | undefined = this.hiddenElements.pop();
    while (el) {
      el.removeAttribute('aria-hidden');
      el = this.hiddenElements.pop();
    }
  }

  private hideSiblingsRecursively(element: Element | ShadowRoot) {
    const parent = getParent(element);
    if (parent === null) {
      return;
    }
    Array.from(parent.children as HTMLCollection).forEach((sibling) => {
      if (sibling === element) {
        return;
      }
      if (sibling.assignedSlot && isAncestorOf(this, sibling.assignedSlot)) {
        return;
      }
      this.hide(sibling);
    });
    if (parent !== this.scope) {
      this.hideSiblingsRecursively(parent);
    }
  }

  private showSelf() {
    this.parentToHide.removeAttribute('aria-hidden');
    this.parentToHide.removeAttribute('tabindex');
  }

  private hideSelf() {
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
      getFirstFocusableDescendant(this)?.focus();
    }
    this.hideSiblingsRecursively(this);
  }

  @watch('active', {waitUntilFirstUpdate: true})
  async handleActiveChange(_prev?: boolean, next?: boolean) {
    const isInitialLoad = next === _prev;
    if (next) {
      await this.onActivated(isInitialLoad);
    } else {
      await this.onDeactivated(isInitialLoad);
    }
  }

  private onFocusChanged = (e: FocusEvent) => {
    const elementIsPartOfHost = (focusedElement: Element | ShadowRoot) =>
      isAncestorOf(this, focusedElement);

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

    getFirstFocusableDescendant(this)?.focus();
  };

  private get parentToHide(): Element {
    return this.container ?? this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-focus-trap': AtomicFocusTrap;
  }
}
