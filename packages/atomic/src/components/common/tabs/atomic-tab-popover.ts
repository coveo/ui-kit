import {
  createPopperLite as createPopper,
  type Instance as PopperInstance,
  preventOverflow,
} from '@popperjs/core';
import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import ArrowBottomIcon from '@/src/images/arrow-bottom-rounded.svg';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import type {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';
import {renderButton} from '../button';

/**
 * The `atomic-tab-popover` component displays overflowing tabs in a dropdown popover.
 *
 * @internal
 *
 * @part popover-button - The button that triggers the popover.
 * @part value-label - The label text inside the popover button.
 * @part arrow-icon - The arrow icon inside the popover button.
 * @part backdrop - The transparent backdrop that closes the popover when clicked.
 * @part overflow-tabs - The container for the overflow tab items.
 *
 * @slot (default) - The overflow tab items to display in the popover.
 */
@customElement('atomic-tab-popover')
@bindings()
@withTailwindStyles
export class AtomicTabPopover
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles = css`
    @reference '../../../utils/tailwind.global.tw.css';
    
    :host {
      position: absolute;
    }
    
    :host(.visibility-hidden) {
      visibility: hidden;
    }
    
    [part='overflow-tabs'] {
      flex-direction: column;
      max-width: 150px;
    }
    
    [part='overflow-tabs'] button {
      text-align: start;
    }
  `;

  @state()
  bindings!: Bindings;

  @state()
  public error!: Error;

  @state()
  public show = false;

  @state()
  private isOpen = false;

  private buttonRef: Ref<HTMLButtonElement> = createRef();
  private popupRef: Ref<HTMLUListElement> = createRef();
  private popperInstance?: PopperInstance;

  public readonly popoverId = 'atomic-tab-popover';

  public initialize() {
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('focusout', this.handleFocusOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.popperInstance?.destroy();
  }

  /**
   * Toggles the popover open/closed state.
   */
  public toggle() {
    this.isOpen = !this.isOpen;
  }

  /**
   * Sets the visibility of the popover button.
   */
  public setButtonVisibility(isVisible: boolean) {
    this.show = isVisible;
    if (isVisible) {
      this.classList.remove('visibility-hidden');
    } else {
      this.classList.add('visibility-hidden');
    }
    this.setAttribute('aria-hidden', String(!isVisible));
  }

  /**
   * Closes the popover when focus moves outside.
   */
  public closePopoverOnFocusOut(event: FocusEvent) {
    const slot = this.popupRef.value?.querySelector('slot');
    if (!slot) return;

    const assignedElements = (
      slot as HTMLSlotElement
    ).assignedElements() as HTMLElement[];

    const isMovingToSlottedElement = assignedElements.some(
      (element) =>
        element === event.relatedTarget ||
        element.contains(event.relatedTarget as Node)
    );

    if (isMovingToSlottedElement) {
      return;
    }

    if (!this.popupRef.value?.contains(event.relatedTarget as Node)) {
      this.closePopover();
    }
  }

  @errorGuard()
  render() {
    const hostClasses = tw({
      'visibility-hidden': !this.show,
    });

    return html`
      <div class=${multiClassMap(hostClasses)}>
        ${this.renderPopover()}
        ${when(this.isOpen, () => this.renderBackdrop())}
      </div>
    `;
  }

  firstUpdated() {
    this.initializePopper();
  }

  updated(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has('isOpen')) {
      this.popperInstance?.forceUpdate();
    }
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
    const slot = this.popupRef.value?.querySelector('slot');
    if (!slot) return [];

    return Array.from((slot as HTMLSlotElement).assignedElements())
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

  private closePopover() {
    this.isOpen = false;
  }

  private initializePopper() {
    if (this.popperInstance || !this.buttonRef.value || !this.popupRef.value) {
      return;
    }

    this.popperInstance = createPopper(
      this.buttonRef.value,
      this.popupRef.value,
      {
        placement: 'bottom-end',
        modifiers: [preventOverflow],
      }
    );
    this.popupRef.value.classList.add('popover-nested');
  }

  private renderDropdownButton() {
    const label = this.bindings?.i18n.t('more');
    const ariaLabel = this.bindings?.i18n.t('tab-popover', {label});

    const arrowClasses = tw({
      'rotate-180': this.isOpen,
    });

    return renderButton({
      props: {
        style: 'text-transparent',
        onClick: () => this.toggle(),
        part: 'popover-button',
        ariaExpanded: this.isOpen ? 'true' : 'false',
        ariaLabel,
        ariaControls: this.popoverId,
        class: 'relative pb-1 mt-1 group mr-6 font-semibold',
        ref: this.buttonRef,
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
        class="group-hover:text-primary-light group-focus:text-primary ml-auto w-2 ${multiClassMap(arrowClasses)}"
        icon=${ArrowBottomIcon}
      ></atomic-icon>
    `);
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
    const containerClasses = tw({
      'z-9999': this.isOpen,
    });

    const popoverClasses = tw({
      flex: this.isOpen,
      hidden: !this.isOpen,
    });

    return html`
      <div class="relative ${multiClassMap(containerClasses)}">
        ${this.renderDropdownButton()}
        <ul
          id=${this.popoverId}
          ${ref(this.popupRef)}
          part="overflow-tabs"
          class="bg-background border-neutral absolute rounded-lg border py-2 shadow-lg ${multiClassMap(popoverClasses)}"
        >
          <slot></slot>
        </ul>
      </div>
    `;
  }
}
