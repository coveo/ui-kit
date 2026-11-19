import type {SearchStatus, SearchStatusState} from '@coveo/headless';
import {
  createPopperLite as createPopper,
  type Instance as PopperInstance,
  preventOverflow,
} from '@popperjs/core';
import {html, type LitElement, type ReactiveController, type TemplateResult} from 'lit';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import ArrowBottomIcon from '../../../../images/arrow-bottom-rounded.svg';
import {type PopoverChildFacet, popoverClass} from './popover-type';
import '@/src/components/common/atomic-focus-trap/atomic-focus-trap';
import '@/src/components/common/atomic-icon/atomic-icon';

export interface FacetPopoverHost extends LitElement {
  bindings: Bindings;
  searchStatus?: SearchStatus;
  searchStatusState?: SearchStatusState;
}

/**
 * Displays the facet slotted in its host as a popover menu. `atomic-facet-popover` and the deprecated
 * `atomic-popover` share it.
 */
export class FacetPopoverController implements ReactiveController {
  private buttonRef: Ref<HTMLButtonElement> = createRef();
  private popupRef: Ref<HTMLDivElement> = createRef();
  private popperInstance?: PopperInstance;
  private isOpen = false;
  private childFacet?: PopoverChildFacet;

  constructor(private host: FacetPopoverHost) {
    host.addController(this);
  }

  public hostConnected() {
    this.host.addEventListener(
      'atomic/initializePopover',
      this.handleInitializePopover as EventListener
    );
    this.host.addEventListener('keydown', this.handleKeyDown);
  }

  public hostDisconnected() {
    this.host.removeEventListener(
      'atomic/initializePopover',
      this.handleInitializePopover as EventListener
    );
    this.host.removeEventListener('keydown', this.handleKeyDown);
  }

  public hostUpdated() {
    if (!this.buttonRef.value || !this.popupRef.value) {
      return;
    }

    if (!this.popperInstance) {
      this.popperInstance = createPopper(this.buttonRef.value, this.popupRef.value, {
        placement: 'bottom-start',
        modifiers: [preventOverflow],
      });
    } else {
      this.popperInstance.forceUpdate();
    }
  }

  /**
   * Returns the error to display when the host does not wrap exactly one facet.
   */
  public validateChildren(): Error | undefined {
    if (this.host.children.length === 0) {
      return new Error('One child is required inside a set of popover tags.');
    }

    if (this.host.children.length > 1) {
      return new Error('Cannot have more than one child inside a set of popover tags.');
    }
  }

  public render() {
    const {searchStatus, searchStatusState} = this.host;
    if (!searchStatus || searchStatusState?.hasError) {
      return html``;
    }

    if (!searchStatusState?.firstSearchExecuted) {
      return html`
        <div
          part="placeholder"
          aria-hidden="true"
          class="bg-neutral h-8 w-32 animate-pulse rounded"
        ></div>
      `;
    }

    if (!searchStatusState?.hasResults || !this.childFacet?.hasValues()) {
      return html``;
    }

    return html`
      <atomic-focus-trap
        .source=${this.buttonRef.value}
        .container=${this.popupRef.value}
        .active=${this.isOpen}
        .disableHideSelf=${true}
      >
        ${this.renderPopover()} ${when(this.isOpen, () => this.renderBackdrop())}
      </atomic-focus-trap>
    `;
  }

  private renderDropdownButton() {
    const label = this.label;
    const hasActiveValues = !!this.childFacet!.numberOfActiveValues();
    const count = this.childFacet!.numberOfActiveValues().toLocaleString(
      this.host.bindings.i18n.language
    );
    const ariaLabel = this.host.bindings.i18n.t('popover', {label});

    const buttonClasses = tw({
      'hover:border-primary-light focus-visible:border-primary-light group box-border flex h-full max-w-60 min-w-24 items-center rounded p-2.5 hover:border focus-visible:border overflow-hidden relative': true,
      'border-primary ring-ring-primary text-primary z-9999 ring-3': this.isOpen,
    });

    const labelClasses = tw({
      'mr-1.5 truncate': true,
      'group-hover:text-primary-light group-focus:text-primary': !this.isOpen,
    });

    const countClasses = tw({
      'group-hover:text-primary-light group-focus:text-primary mr-1.5 truncate text-sm': true,
      hidden: !hasActiveValues,
      'text-primary': this.isOpen,
      'text-neutral-dark': !this.isOpen,
    });

    const iconClasses = tw({
      'group-hover:text-primary-light group-focus:text-primary ml-auto w-2': true,
      'rotate-180': this.isOpen,
    });

    const buttonClassString = Object.entries(buttonClasses)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(' ');

    return renderButton({
      props: {
        ref: this.buttonRef,
        style: 'square-neutral',
        onClick: () => this.toggleOpen(),
        part: 'popover-button',
        ariaExpanded: this.isOpen ? 'true' : 'false',
        ariaLabel,
        ariaControls: this.popoverId,
        class: buttonClassString,
      },
    })(html`
      <span title=${label} part="value-label" class=${multiClassMap(labelClasses)}> ${label} </span>
      <span part="value-count" class=${multiClassMap(countClasses)}>
        ${this.host.bindings.i18n.t('between-parentheses', {
          text: count,
        })}
      </span>
      <atomic-icon
        part="arrow-icon"
        class=${multiClassMap(iconClasses)}
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
    this.host.requestUpdate();
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
    this.host.requestUpdate();
  }

  private toggleOpen() {
    this.isOpen = !this.isOpen;
    this.host.requestUpdate();
  }
}
