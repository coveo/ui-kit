import type {
  FacetState,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {buildSearchStatus} from '@coveo/headless';
import {
  createPopperLite as createPopper,
  type Instance as PopperInstance,
  preventOverflow,
} from '@popperjs/core';
import {css, html, LitElement, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {PopoverChildFacet} from '@/src/components/common/facets/popover/popover-type';
import {popoverClass} from '@/src/components/common/facets/popover/popover-type';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import '@/src/components/common/atomic-focus-trap/atomic-focus-trap';
import '@/src/components/common/atomic-icon/atomic-icon';

/**
 * The `atomic-popover` component displays any facet as a popover menu.
 *
 * @slot default - The required slotted facet.
 * @part backdrop - The transparent backdrop hiding the content behind popover menu.
 * @part popover-button - The button to click to display or hide the popover menu.
 * @part value-label - The associated facet label.
 * @part value-count - Number of selected values for the facet
 * @part arrow-icon - The arrow icon on the button to display or hide the popover menu.
 * @part placeholder - The placeholder displayed when the facet is loading.
 * @part facet - The wrapper that contains the slotted 'facet'.
 */
@customElement('atomic-popover')
@bindings()
@withTailwindStyles
export class AtomicPopover
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = css`
    @reference '../../../utils/tailwind.global.tw.css';
  `;

  @state()
  bindings!: Bindings;

  @state()
  error!: Error;

  private buttonRef: Ref<HTMLButtonElement> = createRef();
  private popupRef: Ref<HTMLDivElement> = createRef();
  private popperInstance?: PopperInstance;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;
  public searchStatus!: SearchStatus;

  @state()
  public facetState!: FacetState;

  @state() private isOpen = false;
  @state() private childFacet?: PopoverChildFacet;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);

    if (this.children.length === 0) {
      this.error = new Error(
        'One child is required inside a set of popover tags.'
      );

      return;
    }

    if (this.children.length > 1) {
      this.error = new Error(
        'Cannot have more than one child inside a set of popover tags.'
      );
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/initializePopover',
      this.handleInitializePopover as EventListener
    );
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/initializePopover',
      this.handleInitializePopover as EventListener
    );
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  @bindingGuard()
  @errorGuard()
  public render() {
    if (!this.searchStatus || this.searchStatusState?.hasError) {
      return html``;
    }

    if (!this.searchStatusState?.firstSearchExecuted) {
      return html`
        <div
          part="placeholder"
          aria-hidden="true"
          class="bg-neutral h-8 w-32 animate-pulse rounded"
        ></div>
      `;
    }

    if (!this.searchStatusState?.hasResults || !this.childFacet?.hasValues()) {
      return html``;
    }

    return html`
      <atomic-focus-trap
        .source=${this.buttonRef.value}
        .container=${this.popupRef.value}
        .active=${this.isOpen}
        .shouldHideSelf=${false}
      >
        ${this.renderPopover()}
      </atomic-focus-trap>
      ${when(this.isOpen, () => this.renderBackdrop())}
    `;
  }

  protected updated() {
    if (!this.buttonRef.value || !this.popupRef.value) {
      return;
    }

    if (!this.popperInstance) {
      this.popperInstance = createPopper(
        this.buttonRef.value,
        this.popupRef.value,
        {
          placement: 'bottom-start',
          modifiers: [preventOverflow],
        }
      );
    } else {
      this.popperInstance.forceUpdate();
    }
  }

  private renderDropdownButton() {
    const label = this.label;
    const hasActiveValues = !!this.childFacet!.numberOfActiveValues();
    const count = this.childFacet!.numberOfActiveValues().toLocaleString(
      this.bindings.i18n.language
    );
    const ariaLabel = this.bindings.i18n.t('popover', {label});

    return renderButton({
      props: {
        ref: this.buttonRef,
        style: 'square-neutral',
        onClick: () => this.toggleOpen(),
        part: 'popover-button',
        ariaExpanded: this.isOpen ? 'true' : 'false',
        ariaLabel,
        ariaControls: this.popoverId,
        class: `hover:border-primary-light focus-visible:border-primary-light group box-border flex h-full max-w-60 min-w-24 items-center rounded p-2.5 hover:border focus-visible:border ${
          this.isOpen
            ? 'border-primary ring-ring-primary text-primary z-9999 ring-3'
            : ''
        }`,
      },
    })(html`
      <span
        title=${label}
        part="value-label"
        class=${`mr-1.5 truncate ${
          this.isOpen
            ? ''
            : 'group-hover:text-primary-light group-focus:text-primary'
        }`}
      >
        ${label}
      </span>
      <span
        part="value-count"
        class=${`group-hover:text-primary-light group-focus:text-primary mr-1.5 truncate text-sm ${
          hasActiveValues ? '' : 'hidden'
        } ${this.isOpen ? 'text-primary' : 'text-neutral-dark'}`}
      >
        ${this.bindings.i18n.t('between-parentheses', {
          text: count,
        })}
      </span>
      <atomic-icon
        part="arrow-icon"
        class=${`group-hover:text-primary-light group-focus:text-primary ml-auto w-2 ${
          this.isOpen ? 'rotate-180' : ''
        }`}
        .icon=${ArrowBottomIcon}
      ></atomic-icon>
    `);
  }

  private renderBackdrop(): TemplateResult {
    return html`
      <div
        part="backdrop"
        class="fixed top-0 right-0 bottom-0 left-0 z-9998 cursor-pointer bg-transparent"
        @click=${() => this.closePopover()}
      ></div>
    `;
  }

  private renderPopover(): TemplateResult {
    return html`
      <div class=${`relative ${this.isOpen ? 'z-9999' : ''}`}>
        ${this.renderDropdownButton()}
        <div
          id=${this.popoverId}
          ${ref(this.popupRef)}
          part="facet"
          class=${`absolute pt-0.5 ${this.isOpen ? 'block' : 'hidden'}`}
        >
          <slot></slot>
        </div>
      </div>
    `;
  }

  private handleInitializePopover = (event: CustomEvent<PopoverChildFacet>) => {
    if (this.childFacet || !event.detail) {
      return;
    }

    this.childFacet = event.detail;
    this.childFacet.element.classList.add(popoverClass);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isOpen) {
      this.closePopover();
    }
  };

  private get popoverId() {
    return `${this.childFacet?.facetId}-popover`;
  }

  private get label() {
    return this.childFacet!.label();
  }

  private closePopover() {
    this.isOpen = false;
  }

  private toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-popover': AtomicPopover;
  }
}
