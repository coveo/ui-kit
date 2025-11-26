import {
  createPopperLite as createPopper,
  type Instance as PopperInstance,
  preventOverflow,
} from '@popperjs/core';
import {html, LitElement} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import ArrowBottomIcon from '@/src/images/arrow-bottom-rounded.svg';

/**
 * The `atomic-tab-popover` component is an internal tab overflow popover element.
 * @internal
 *
 * @part popover-button - The button to open the popover
 * @part value-label - The label in the popover button
 * @part arrow-icon - The arrow icon in the popover button
 * @part backdrop - The backdrop overlay
 * @part overflow-tabs - The list of overflow tabs
 */
@customElement('atomic-tab-popover')
@bindings()
export class AtomicTabPopover
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;
  @state() public error!: Error;

  @state() public show = false;
  @state() private isOpen = false;

  @query('[data-button-ref]') private buttonRef!: HTMLElement;
  @query('[data-popup-ref]') private popupRef!: HTMLElement;

  private popperInstance?: PopperInstance;
  public popoverId = 'atomic-tab-popover';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('focusout', this.handleFocusOut as EventListener);
    this.style.position = 'absolute';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusout', this.handleFocusOut as EventListener);
    this.popperInstance?.destroy();
  }

  public initialize() {}

  private initializePopover() {
    this.popupRef.classList.add('popover-nested');
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

  private getTabButtons(): HTMLButtonElement[] {
    const slot = this.popupRef.querySelector('slot') as HTMLSlotElement;
    if (!slot) return [];
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

  public toggle() {
    this.isOpen = !this.isOpen;
  }

  public setButtonVisibility(isVisible: boolean) {
    this.show = isVisible;
  }

  private handleFocusOut = (event: FocusEvent) => {
    const slot = this.popupRef.querySelector('slot') as HTMLSlotElement;
    if (!slot) return;
    const assignedElements = slot.assignedElements() as HTMLElement[];

    const isMovingToSlottedElement = assignedElements.some(
      (element) =>
        element === event.relatedTarget ||
        element.contains(event.relatedTarget as Node)
    );

    if (isMovingToSlottedElement) {
      return;
    }

    if (!this.popupRef.contains(event.relatedTarget as Node)) {
      this.closePopover();
    }
  };

  private closePopover() {
    this.isOpen = false;
  }

  private renderDropdownButton() {
    const label = this.bindings?.i18n.t('more');
    const ariaLabel = this.bindings?.i18n.t('tab-popover', {label});
    const buttonClasses = [
      'relative',
      'pb-1',
      'mt-1',
      'group',
      'mr-6',
      'font-semibold',
    ];

    return html`
      <div data-button-ref>
        ${renderButton({
          props: {
            style: 'text-transparent',
            onClick: () => this.toggle(),
            part: 'popover-button',
            ariaExpanded: `${this.isOpen}`,
            ariaLabel,
            ariaControls: this.popoverId,
            class: `${buttonClasses.join(' ')}`,
          },
        })(html`
          <span
            title=${label}
            part="value-label"
            class="group-hover:text-primary-light group-focus:text-primary mr-1.5 truncate"
          >
            ${label}
          </span>
          <atomic-icon
            part="arrow-icon"
            class="group-hover:text-primary-light group-focus:text-primary ml-auto w-2 ${
              this.isOpen ? 'rotate-180' : ''
            }"
            .icon=${ArrowBottomIcon}
          ></atomic-icon>
        `)}
      </div>
    `;
  }

  private renderBackdrop() {
    return html`
      <div
        part="backdrop"
        class="fixed top-0 right-0 bottom-0 left-0 z-9998 cursor-pointer bg-transparent"
        @click=${() => this.toggle()}
      ></div>
    `;
  }

  private renderPopover() {
    return html`
      <div class="relative ${this.isOpen ? 'z-9999' : ''}">
        ${this.renderDropdownButton()}
        <ul
          id=${this.popoverId}
          data-popup-ref
          part="overflow-tabs"
          class="bg-background border-neutral absolute rounded-lg border py-2 shadow-lg ${
            this.isOpen ? 'flex' : 'hidden'
          }"
          style="flex-direction: column; max-width: 150px;"
        >
          <slot></slot>
        </ul>
      </div>
    `;
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    if (!this.popperInstance && this.buttonRef && this.popupRef) {
      this.popperInstance = createPopper(this.buttonRef, this.popupRef, {
        placement: 'bottom-end',
        modifiers: [preventOverflow],
      });
      this.initializePopover();
    }

    if (this.popperInstance) {
      this.popperInstance.forceUpdate();
    }

    if (changedProperties.has('show')) {
      this.style.visibility = this.show ? 'visible' : 'hidden';
      this.setAttribute('aria-hidden', String(!this.show));
    }
  }

  render() {
    return html`
      ${this.renderPopover()} ${when(this.isOpen, () => this.renderBackdrop())}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab-popover': AtomicTabPopover;
  }
}
