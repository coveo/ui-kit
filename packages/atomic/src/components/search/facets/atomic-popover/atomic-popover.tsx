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
import {InitializePopoverEvent, popoverClass} from './popover-type';
import {FacetInfo} from '../../../common/facets/facet-common-store';

interface ClearPopoverEvent {
  ownId?: string;
}

/**
 * @internal
 * The `atomic-popover` component displays any facet as a popover menu.
 *
 * @part popover-button - The button to click to display or hide the popover menu.
 * @part label - The popover button label.
 * @part value-count - Number of selected values for the facet
 * @part arrow-icon - The arrow icon on the button to display or hide the popover menu.
 * @part placeholder - The placeholder displayed when the facet is loading.
 * @part popover-wrapper - The wrapper that contains the 'popover-button' and the 'slot-wrapper'.
 * @part slot-wrapper - The wrapper that contains the 'facet' or 'slot'.
 */
@Component({
  tag: 'atomic-popover',
  styleUrl: 'atomic-popover.pcss',
  shadow: true,
})
export class AtomicPopover implements InitializableComponent {
  @Element() host!: HTMLElement;
  private getHasValues?: () => boolean;
  private getNumberOfSelectedValues?: () => number;
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
  @State() private facetInfo?: FacetInfo;

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
    if (event.detail.ownId !== this.facetInfo?.facetId) {
      this.isOpen = false;
    }
  }

  @Listen('atomic/initializePopover')
  public initializePopover(event: CustomEvent<InitializePopoverEvent>) {
    if (this.facetInfo || !event.detail) {
      return;
    }

    this.facetInfo = event.detail.facetInfo;
    this.facetInfo.element.classList.add(popoverClass);
    this.getHasValues = event.detail.getHasValues;
    this.getNumberOfSelectedValues = event.detail.getNumberOfSelectedValues;
  }

  private get popoverId() {
    return `${this.facetInfo?.facetId}-popover`;
  }

  private popoverOpened() {
    if (!this.isOpen) {
      this.closePopovers.emit({ownId: this.facetInfo?.facetId});
    }

    this.isOpen = !this.isOpen;
  }

  private renderValueButton() {
    return (
      <Button
        style="square-neutral"
        onClick={() => this.popoverOpened()}
        part="popover-button"
        ariaExpanded={`${this.isOpen}`}
        ariaLabel={`Pop-up filter on ${this.facetInfo?.label} facet`} // TODO: localize for show/hide
        ariaControls={this.popoverId}
        class={`rounded flex box-border h-full items-center min-w-[6rem] max-w-[15rem] p-2.5 group ${
          this.isOpen
            ? 'border-primary ring ring-ring-primary text-primary'
            : 'hover:border-primary-light focus-visible:border-primary-light '
        }`}
      >
        <span
          title={this.facetInfo?.label}
          part="label"
          class={`truncate mr-0.5 ${
            this.isOpen
              ? ''
              : 'group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {this.facetInfo?.label}
        </span>
        <span
          title={this.getNumberOfSelectedValues?.().toLocaleString()}
          part="value-count"
          class={`truncate text-sm ${
            this.getNumberOfSelectedValues?.() ? '' : 'hidden'
          } ${
            this.isOpen
              ? 'text-primary'
              : 'text-neutral-dark group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {this.bindings.i18n.t('between-parentheses', {
            text: this.getNumberOfSelectedValues?.(),
          })}
        </span>
        <atomic-icon
          part="arrow-icon"
          aria-hidden="true"
          class={`w-2 ml-auto ${
            this.isOpen
              ? 'rotate-180'
              : 'group-hover:text-primary-light group-focus:text-primary'
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

    if (!this.searchStatus.state.hasResults || !this.getHasValues?.()) {
      return <Hidden></Hidden>;
    }

    return (
      <div id={this.popoverId} part="popover-wrapper" class="relative">
        {this.renderValueButton()}
        <div
          part="slot-wrapper"
          class={`absolute pt-0.5 z-10 ${this.isOpen ? 'block' : 'hidden'}`}
        >
          <slot></slot>
        </div>
      </div>
    );
  }
}
