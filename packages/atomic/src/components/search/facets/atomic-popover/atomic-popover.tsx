import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  FacetState,
} from '@coveo/headless';
import {
  createPopperLite as createPopper,
  preventOverflow,
  Instance as PopperInstance,
} from '@popperjs/core';
import {Component, h, Listen, State, Element, Host} from '@stencil/core';
import ArrowBottomIcon from '../../../../images/arrow-bottom-rounded.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  PopoverChildFacet,
  popoverClass,
} from '../../../common/facets/popover/popover-type';
import {Button} from '../../../common/stencil-button';
import {Hidden} from '../../../common/stencil-hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

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
@Component({
  tag: 'atomic-popover',
  styleUrl: 'atomic-popover.pcss',
  shadow: true,
})
export class AtomicPopover implements InitializableComponent {
  @Element() private host!: HTMLElement;
  private buttonRef!: HTMLElement;
  private popupRef!: HTMLElement;
  private popperInstance?: PopperInstance;
  @InitializeBindings()
  public bindings!: Bindings;
  private searchStatus!: SearchStatus;

  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
  @State()
  public error!: Error;
  @State() private isOpen = false;
  @State() private childFacet?: PopoverChildFacet;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);

    if (this.host.children.length === 0) {
      this.error = new Error(
        'One child is required inside a set of popover tags.'
      );

      return;
    }

    if (this.host.children.length > 1) {
      this.error = new Error(
        'Cannot have more than one child inside a set of popover tags.'
      );
    }
  }

  @Listen('atomic/initializePopover')
  public initializePopover(event: CustomEvent<PopoverChildFacet>) {
    if (this.childFacet || !event.detail) {
      return;
    }

    this.childFacet = event.detail;
    this.childFacet.element.classList.add(popoverClass);
  }

  @Listen('keydown')
  public handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.isOpen) {
      this.togglePopover();
    }
  }

  private get popoverId() {
    return `${this.childFacet?.facetId}-popover`;
  }

  private get label() {
    return this.childFacet!.label();
  }

  private togglePopover() {
    this.isOpen = !this.isOpen;
  }

  public componentDidRender() {
    if (this.popperInstance || !this.buttonRef || !this.popupRef) {
      return;
    }

    this.popperInstance = createPopper(this.buttonRef, this.popupRef, {
      placement: 'bottom-start',
      modifiers: [preventOverflow],
    });
  }

  public componentDidUpdate() {
    this.popperInstance?.forceUpdate();
  }

  private renderDropdownButton() {
    const label = this.label;
    const hasActiveValues = !!this.childFacet!.numberOfActiveValues();
    const count = this.childFacet!.numberOfActiveValues().toLocaleString();
    const ariaLabel = this.bindings.i18n.t('popover', {label});

    return (
      <Button
        ref={(el) => (this.buttonRef = el!)}
        style="square-neutral"
        onClick={() => this.togglePopover()}
        part="popover-button"
        ariaExpanded={`${this.isOpen}`}
        ariaLabel={ariaLabel}
        ariaControls={this.popoverId}
        class={`hover:border-primary-light focus-visible:border-primary-light group box-border flex h-full min-w-24 max-w-60 items-center rounded p-2.5 hover:border focus-visible:border ${
          this.isOpen
            ? 'border-primary ring-ring-primary text-primary z-9999 ring-3'
            : ''
        }`}
      >
        <span
          title={label}
          part="value-label"
          class={`mr-1.5 truncate ${
            this.isOpen
              ? ''
              : 'group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {label}
        </span>
        <span
          part="value-count"
          class={`group-hover:text-primary-light group-focus:text-primary mr-1.5 truncate text-sm ${
            hasActiveValues ? '' : 'hidden'
          } ${this.isOpen ? 'text-primary' : 'text-neutral-dark'}`}
        >
          {this.bindings.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
        <atomic-icon
          part="arrow-icon"
          class={`group-hover:text-primary-light group-focus:text-primary ml-auto w-2 ${
            this.isOpen ? 'rotate-180' : ''
          } `}
          icon={ArrowBottomIcon}
        ></atomic-icon>
      </Button>
    );
  }

  private renderBackdrop() {
    return (
      <div
        part="backdrop"
        class="z-9998 fixed bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent"
        onClick={() => this.togglePopover()}
      ></div>
    );
  }

  private renderPopover() {
    return (
      <div class={`relative ${this.isOpen ? 'z-9999' : ''}`}>
        {this.renderDropdownButton()}
        <div
          id={this.popoverId}
          ref={(el) => (this.popupRef = el!)}
          part="facet"
          class={`absolute pt-0.5 ${this.isOpen ? 'block' : 'hidden'}`}
        >
          <slot></slot>
        </div>
      </div>
    );
  }

  public render() {
    if (this.searchStatus.state.hasError) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatus.state.firstSearchExecuted) {
      return (
        <div
          part="placeholder"
          aria-hidden
          class="bg-neutral h-8 w-32 animate-pulse rounded"
        ></div>
      );
    }

    if (!this.searchStatus.state.hasResults || !this.childFacet?.hasValues()) {
      return <Hidden></Hidden>;
    }

    return (
      <Host>
        <atomic-focus-trap
          source={this.buttonRef}
          container={this.popupRef}
          active={this.isOpen}
          shouldHideSelf={false}
        >
          {this.renderPopover()}
        </atomic-focus-trap>
        {this.isOpen && this.renderBackdrop()}
      </Host>
    );
  }
}
