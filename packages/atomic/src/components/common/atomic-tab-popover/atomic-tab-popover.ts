import {
  createPopperLite as createPopper,
  type Instance as PopperInstance,
  preventOverflow,
} from '@popperjs/core';
import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import ArrowBottomIcon from '@/src/images/arrow-bottom-rounded.svg';

/**
 * The `atomic-tab-popover` is an internal component that provides a popover menu for tab overflow.
 * @internal
 *
 * @part popover-button - The button that triggers the popover.
 * @part value-label - The label displayed on the popover button.
 * @part arrow-icon - The arrow icon on the popover button.
 * @part backdrop - The backdrop behind the popover.
 * @part overflow-tabs - The container for overflow tab items.
 *
 * @slot (default) - The overflow tab items.
 */
@customElement('atomic-tab-popover')
@bindings()
@withTailwindStyles
export class AtomicTabPopover
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = css`
    @reference '@/src/utils/tailwind.global.tw.css';

    :host {
      position: absolute;
    }

    :host(.visibility-hidden) {
      visibility: hidden;
    }

    [part='overflow-tabs'] {
      flex-direction: column;
      max-width: 150px;

      button {
        text-align: start;
      }
    }
  `;

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() public show = false;
  @state() private isOpen = false;

  private buttonRef: Ref<HTMLButtonElement> = createRef();
  private popupRef: Ref<HTMLUListElement> = createRef();
  private popperInstance?: PopperInstance;
  public popoverId = 'atomic-tab-popover';

  public initialize() {
    this.addEventListener('keydown', this.handleKeyDown);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('focusout', this.handleFocusOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.popperInstance?.destroy();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.isOpen) {
      return;
    }

    if (e.key === 'Escape') {
      this.toggle();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigatePopover(e.key);
    }
  };

  private handleFocusOut = (event: FocusEvent) => {
    this.closePopoverOnFocusOut(event);
  };

  private getTabButtons(): HTMLButtonElement[] {
    const popup = this.popupRef.value;
    if (!popup) {
      return [];
    }
    const slot = popup.children[0] as HTMLSlotElement | undefined;
    if (!slot) {
      return [];
    }
    return Array.from(slot.assignedElements())
      .map((el) => (el as HTMLElement).querySelector('button'))
      .filter((el): el is HTMLButtonElement => el !== null);
  }

  private getCurrentTabIndex(elements: HTMLButtonElement[]): number {
    const MAX_SHADOW_DEPTH = 3;
    let currentElement = document.activeElement;
    let depth = 0;

    while (currentElement?.shadowRoot && depth < MAX_SHADOW_DEPTH) {
      currentElement = currentElement.shadowRoot.activeElement;
      depth++;
    }

    if (!(currentElement instanceof HTMLButtonElement)) {
      return -1;
    }

    return elements.indexOf(currentElement);
  }

  private navigatePopover(key: string): void {
    const tabButtons = this.getTabButtons();
    if (!tabButtons.length) {
      return;
    }

    const currentIndex = this.getCurrentTabIndex(tabButtons);
    const startIndex = currentIndex > -1 ? currentIndex : -1;

    let nextIndex: number;
    if (currentIndex === -1) {
      nextIndex = key === 'ArrowDown' ? 0 : tabButtons.length - 1;
    } else {
      nextIndex =
        key === 'ArrowDown'
          ? (startIndex + 1) % tabButtons.length
          : (startIndex - 1 + tabButtons.length) % tabButtons.length;
    }

    tabButtons[nextIndex]?.focus();
  }

  get slotElements() {
    return this.children;
  }

  get hasTabs() {
    const popup = this.popupRef.value;
    return popup ? !!popup.children.length : false;
  }

  public toggle() {
    this.isOpen = !this.isOpen;
  }

  public setButtonVisibility(isVisible: boolean) {
    this.show = isVisible;
  }

  public closePopoverOnFocusOut(event: FocusEvent) {
    const popup = this.popupRef.value;
    if (!popup) {
      return;
    }
    const slot = popup.children[0] as HTMLSlotElement | undefined;
    if (!slot) {
      return;
    }
    const assignedElements = slot.assignedElements() as HTMLElement[];

    const isMovingToSlottedElement = assignedElements.some(
      (element) =>
        element === event.relatedTarget ||
        element.contains(event.relatedTarget as Node)
    );

    if (isMovingToSlottedElement) {
      return;
    }

    if (!popup.contains(event.relatedTarget as Node)) {
      this.closePopover();
    }
  }

  private closePopover() {
    this.isOpen = false;
  }

  private initializePopper() {
    const button = this.buttonRef.value;
    const popup = this.popupRef.value;
    if (this.popperInstance || !button || !popup) {
      return;
    }

    this.popperInstance = createPopper(button, popup, {
      placement: 'bottom-end',
      modifiers: [preventOverflow],
    });
    popup.classList.add('popover-nested');
  }

  protected updated() {
    this.initializePopper();
    this.popperInstance?.forceUpdate();
  }

  private renderDropdownButton() {
    const label = this.bindings?.i18n.t('more');
    const ariaLabel = this.bindings?.i18n.t('tab-popover', {label});
    const buttonClasses =
      'relative pb-1 mt-1 group mr-6 font-semibold flex items-center';

    return renderButton({
      props: {
        ref: this.buttonRef,
        style: 'text-transparent',
        onClick: () => this.toggle(),
        part: 'popover-button',
        ariaExpanded: this.isOpen ? 'true' : 'false',
        ariaLabel,
        ariaControls: this.popoverId,
        class: buttonClasses,
      },
    })(html`
      <span
        title=${label}
        part="value-label"
        class="group-hover:text-primary group-focus:text-primary mr-1.5 truncate"
      >
        ${label}
      </span>
      <atomic-icon
        part="arrow-icon"
        class="group-hover:text-primary group-focus:text-primary ml-auto w-2 ${
          this.isOpen ? 'rotate-180' : ''
        }"
        .icon=${ArrowBottomIcon}
      ></atomic-icon>
    `);
  }

  private renderBackdrop() {
    return html`<div
      part="backdrop"
      class="fixed top-0 right-0 bottom-0 left-0 z-9998 cursor-pointer bg-transparent"
      @click=${() => this.toggle()}
    ></div>`;
  }

  private renderPopover() {
    return html`
      <div class="relative ${this.isOpen ? 'z-9999' : ''}">
        ${this.renderDropdownButton()}
        <ul
          id=${this.popoverId}
          ${ref(this.popupRef)}
          part="overflow-tabs"
          class="bg-background border-neutral absolute rounded-lg border py-2 shadow-lg ${
            this.isOpen ? 'flex' : 'hidden'
          }"
        >
          <slot></slot>
        </ul>
      </div>
    `;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      <div
        class=${this.show ? '' : 'visibility-hidden'}
        aria-hidden=${!this.show}
      >
        ${this.renderPopover()} ${when(this.isOpen, () => this.renderBackdrop())}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab-popover': AtomicTabPopover;
  }
}
