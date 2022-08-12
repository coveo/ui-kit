import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  FacetState,
} from '@coveo/headless';
import {
  Component,
  h,
  Listen,
  State,
  Element,
  Event,
  EventEmitter,
} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {Hidden} from '../../../common/hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import ArrowBottomIcon from 'coveo-styleguide/resources/icons/svg/arrow-bottom-rounded.svg';
import {
  ClearPopoverEvent,
  PopoverChildFacet,
  popoverClass,
} from './popover-type';
import {
  createPopperLite as createPopper,
  preventOverflow,
  Instance as PopperInstance,
} from '@popperjs/core';

/**
 * @internal
 * The `atomic-popover` component displays any facet as a popover menu.
 *
 * @slot default - The required slotted facet.
 * @part popover-button - The button to click to display or hide the popover menu.
 * @part label - The associated facet label.
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
  private containerRef!: HTMLElement;
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

  @Event({
    eventName: 'atomic/closePopovers',
  })
  private closePopovers!: EventEmitter<ClearPopoverEvent>;

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

  @Listen('atomic/closePopovers', {target: 'document'})
  public popOpened(event: CustomEvent<ClearPopoverEvent>) {
    if (event.detail.popoverEmitterId !== this.childFacet?.facetId) {
      this.isOpen = false;
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

  private get popoverId() {
    return `${this.childFacet?.facetId}-popover`;
  }

  private togglePopover() {
    if (!this.isOpen) {
      this.closePopovers.emit({popoverEmitterId: this.childFacet?.facetId});
    }

    this.isOpen = !this.isOpen;
  }

  public componentDidRender() {
    if (this.popperInstance || !this.containerRef) {
      return;
    }

    this.popperInstance = createPopper(
      this.containerRef,
      this.host.children.item(0)! as HTMLElement,
      {placement: 'bottom-start', modifiers: [preventOverflow /*, flip*/]}
    );
  }

  public componentDidUpdate() {
    this.popperInstance?.forceUpdate();
  }

  private renderDropdownButton() {
    const label = this.bindings.i18n.t(this.childFacet!.label);
    const hasSelectedValues = !!this.childFacet!.numberOfSelectedValues();
    const count = this.childFacet!.numberOfSelectedValues().toLocaleString();
    const ariaLabel = this.bindings.i18n.t('popover', {label});

    return (
      <Button
        style="square-neutral"
        onClick={() => this.togglePopover()}
        part="popover-button"
        ariaExpanded={`${this.isOpen}`}
        ariaLabel={ariaLabel}
        ariaControls={this.popoverId}
        class={`rounded flex box-border h-full items-center min-w-[6rem] max-w-[15rem] p-2.5 group hover:border-primary-light focus-visible:border-primary-light ${
          this.isOpen
            ? 'border-primary ring ring-ring-primary text-primary'
            : ''
        }`}
      >
        <span
          title={label}
          part="value-label"
          class={`truncate mr-1.5 ${
            this.isOpen
              ? ''
              : 'group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {label}
        </span>
        <span
          part="value-count"
          class={`truncate mr-1.5 text-sm group-hover:text-primary-light group-focus:text-primary ${
            hasSelectedValues ? '' : 'hidden'
          } ${this.isOpen ? 'text-primary' : 'text-neutral-dark'}`}
        >
          {this.bindings.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
        <atomic-icon
          part="arrow-icon"
          aria-hidden="true"
          class={`w-2 ml-auto group-hover:text-primary-light group-focus:text-primary ${
            this.isOpen ? 'rotate-180' : ''
          } `}
          icon={ArrowBottomIcon}
        ></atomic-icon>
      </Button>
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
          class="h-8 w-32 bg-neutral animate-pulse rounded"
        ></div>
      );
    }

    if (!this.searchStatus.state.hasResults || !this.childFacet?.hasValues()) {
      return <Hidden></Hidden>;
    }

    return (
      <div class="relative">
        {this.renderDropdownButton()}
        <div
          id={this.popoverId}
          ref={(el) => (this.containerRef = el!)}
          part="facet"
          class={`absolute pt-0.5 z-1 ${this.isOpen ? 'block' : 'hidden'}`}
        >
          <slot></slot>
        </div>
      </div>
    );
  }
}
