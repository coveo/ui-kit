import {
  buildSearchStatus,
  type FacetState,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {
  createPopperLite as createPopper,
  type Instance as PopperInstance,
  preventOverflow,
} from '@popperjs/core';
import {css, html, LitElement, nothing, type PropertyValues} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import ArrowBottomIcon from '@/images/arrow-bottom-rounded.svg';
import {renderButton} from '@/src/components/common/button.js';
import facetCommonStyles from '@/src/components/common/facets/facet-common.tw.css';
import {
  type PopoverChildFacet,
  popoverClass,
} from '@/src/components/common/facets/popover/popover-type.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin.js';

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
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles = [
    css`@reference '../../../utils/tailwind.global.tw.css';`,
    facetCommonStyles,
  ];

  private buttonRef: Ref<HTMLElement> = createRef();
  private popupRef: Ref<HTMLElement> = createRef();
  private popperInstance?: PopperInstance;
  private searchStatus!: SearchStatus;

  @state()
  bindings!: Bindings;

  @state()
  error!: Error;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  @bindStateToController('facet')
  @state()
  public facetState!: FacetState;

  @state()
  private isOpen = false;

  @state()
  private childFacet?: PopoverChildFacet;

  // Lifecycle methods

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/initializePopover',
      this.handleInitializePopover as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/initializePopover',
      this.handleInitializePopover as EventListener
    );
    this.removeEventListener('keydown', this.handleKeyDown as EventListener);
  }

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

    this.addEventListener('keydown', this.handleKeyDown as EventListener);
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (this.popperInstance) {
      this.popperInstance.forceUpdate();
      return;
    }

    const buttonEl = this.buttonRef.value;
    const popupEl = this.popupRef.value;

    if (!buttonEl || !popupEl) {
      return;
    }

    this.popperInstance = createPopper(buttonEl, popupEl, {
      placement: 'bottom-start',
      modifiers: [preventOverflow],
    });
  }

  @errorGuard()
  render() {
    if (this.searchStatus.state.hasError) {
      return nothing;
    }

    if (!this.searchStatus.state.firstSearchExecuted) {
      return html`
        <div
          part="placeholder"
          aria-hidden="true"
          class="bg-neutral h-8 w-32 animate-pulse rounded"
        ></div>
      `;
    }

    if (!this.searchStatus.state.hasResults || !this.childFacet?.hasValues()) {
      return nothing;
    }

    return html`
      <atomic-focus-trap
        .source=${this.buttonRef.value}
        .container=${this.popupRef.value}
        ?active=${this.isOpen}
        should-hide-self="false"
      >
        ${this.renderPopover()}
      </atomic-focus-trap>
      ${when(this.isOpen, () => this.renderBackdrop())}
    `;
  }

  // Event handlers

  private handleInitializePopover = (event: CustomEvent<PopoverChildFacet>) => {
    if (this.childFacet || !event.detail) {
      return;
    }

    this.childFacet = event.detail;
    this.childFacet.element.classList.add(popoverClass);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isOpen) {
      this.togglePopover();
    }
  };

  // Private methods

  private get popoverId() {
    return `${this.childFacet?.facetId}-popover`;
  }

  private get label() {
    return this.childFacet!.label();
  }

  private togglePopover() {
    this.isOpen = !this.isOpen;
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
        style: 'square-neutral',
        onClick: () => this.togglePopover(),
        part: 'popover-button',
        ariaExpanded: this.isOpen ? 'true' : 'false',
        ariaLabel,
        ariaControls: this.popoverId,
        class: multiClassMap(
          tw({
            'hover:border-primary-light focus-visible:border-primary-light group box-border flex h-full max-w-60 min-w-24 items-center rounded p-2.5 hover:border focus-visible:border': true,
            'border-primary ring-ring-primary text-primary z-9999 ring-3':
              this.isOpen,
          })
        ),
        ref: this.buttonRef,
      },
    })(html`
      <span
        title=${label}
        part="value-label"
        class=${multiClassMap(
          tw({
            'mr-1.5 truncate': true,
            'group-hover:text-primary-light group-focus:text-primary':
              !this.isOpen,
          })
        )}
      >
        ${label}
      </span>
      ${when(
        hasActiveValues,
        () => html`
          <span
            part="value-count"
            class=${multiClassMap(
              tw({
                'group-hover:text-primary-light group-focus:text-primary mr-1.5 truncate text-sm': true,
                'text-primary': this.isOpen,
                'text-neutral-dark': !this.isOpen,
              })
            )}
          >
            ${this.bindings.i18n.t('between-parentheses', {
              text: count,
            })}
          </span>
        `
      )}
      <atomic-icon
        part="arrow-icon"
        class=${multiClassMap(
          tw({
            'group-hover:text-primary-light group-focus:text-primary ml-auto w-2': true,
            'rotate-180': this.isOpen,
          })
        )}
        icon=${ArrowBottomIcon}
      ></atomic-icon>
    `);
  }

  private renderBackdrop() {
    return html`
      <div
        part="backdrop"
        class="fixed top-0 right-0 bottom-0 left-0 z-9998 cursor-pointer bg-transparent"
        @click=${() => this.togglePopover()}
      ></div>
    `;
  }

  private renderPopover() {
    return html`
      <div
        class=${multiClassMap(
          tw({
            relative: true,
            'z-9999': this.isOpen,
          })
        )}
      >
        ${this.renderDropdownButton()}
        <div
          id=${this.popoverId}
          ${ref(this.popupRef)}
          part="facet"
          class=${multiClassMap(
            tw({
              'absolute pt-0.5': true,
              block: this.isOpen,
              hidden: !this.isOpen,
            })
          )}
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-popover': AtomicPopover;
  }
}
