import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  FacetState,
} from '@coveo/headless';
import {Component, h, Listen, State, Element} from '@stencil/core';
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
  InitPopoverEventPayload,
  ClearPopoversEventPayload,
} from './popover-event';

/**
 * @internal
 * The `atomic-popover` component displays any facet as a popover menu.
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
  @InitializeBindings()
  public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  @BindStateToController('searchStatus')
  @State()
  public searchStatusState!: SearchStatusState;
  @BindStateToController('facet')
  @State()
  public facetState!: FacetState;
  @State()
  public error!: Error;

  @State() public isMenuVisible = false;
  @State() public facetId?: string;
  @State() public facetLabel?: string = 'no-label';
  @State() public hasValues?: boolean = false;
  @State() public numberOfSelectedValues?: number = 0;
  @Element() host!: HTMLElement;
  private facetElement?: HTMLElement;
  private getHasValues?: () => boolean;
  private getNumberOfSelectedValues?: () => number;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);

    if (this.host.children.length === 0) {
      this.error = {
        name: 'No child in popover',
        message: 'One child is required inside a set of popover tags',
      };
      return;
    }

    if (this.host.children.length > 1) {
      this.error = {
        name: 'Too many children in popover',
        message: 'Cannot have more than one child inside a set of popover tags',
      };
    }
  }

  componentWillRender() {
    this.numberOfSelectedValues =
      this.getNumberOfSelectedValues && this.getNumberOfSelectedValues();
    this.hasValues = this.getHasValues && this.getHasValues();
  }

  private get popoverId() {
    return `${this.facetId}-popover`;
  }

  popoverOpened() {
    if (!this.isMenuVisible) {
      const popoverOpened = new CustomEvent<ClearPopoversEventPayload>(
        'clearPopovers',
        {
          detail: {ignorePopoverFacetId: this.facetId},
        }
      );
      document.dispatchEvent(popoverOpened);
    }

    this.isMenuVisible = !this.isMenuVisible;
  }

  @Listen('clearPopovers', {target: 'document'})
  popOpened(event: CustomEvent<ClearPopoversEventPayload>) {
    if (event.detail.ignorePopoverFacetId !== this.facetId) {
      this.isMenuVisible = false;
    }
  }

  renderValueButton() {
    return (
      <Button
        style="square-neutral"
        onClick={() => this.popoverOpened()}
        part="popover-button"
        ariaExpanded={`${this.isMenuVisible}`}
        ariaLabel={`Pop-up filter on ${this.facetLabel} facet`}
        ariaControls={this.popoverId}
        class={`rounded flex box-border h-full items-center mr-1.5 p-2.5 group ${
          this.isMenuVisible
            ? 'border-primary ring ring-ring-primary text-primary'
            : 'hover:border-primary-light focus-visible:border-primary-light '
        }`}
      >
        <span
          title={this.facetLabel}
          part="label"
          class={`truncate ${
            this.isMenuVisible
              ? ''
              : 'group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {this.facetLabel}
        </span>
        <span
          title={this.numberOfSelectedValues?.toLocaleString()}
          part="value-count"
          class={`value-box-count truncate pl-0.5 w-auto mt-0 text-sm ${
            this.isMenuVisible
              ? 'text-primary'
              : 'text-neutral-dark group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {this.bindings.i18n.t('between-parentheses', {
            text: this.numberOfSelectedValues,
          })}
        </span>
        <atomic-icon
          part="arrow-icon"
          aria-hidden="true"
          class={`w-2 ml-2 ${
            this.isMenuVisible
              ? 'rotate-180'
              : 'group-hover:text-primary-light group-focus:text-primary'
          } `}
          icon={ArrowBottomIcon}
        ></atomic-icon>
      </Button>
    );
  }

  @Listen('facetInitialized')
  linkFacet(event: CustomEvent<InitPopoverEventPayload>) {
    if (this.facetElement) {
      return;
    }

    const facet = this.bindings.store.get(event.detail.facetType)[
      event.detail.facetId
    ];

    if (!facet) {
      this.error = {
        name: 'Undefined facet',
        message: `No facet found inside store with facetId: ${event.detail.facetId}`,
      };
      return;
    }

    this.facetId = facet.facetId;
    this.facetLabel = facet.label;
    this.facetElement = facet.element;
    this.facetElement?.classList.add('popover-nested');

    this.getHasValues = event.detail.getHasValues;
    this.getNumberOfSelectedValues = event.detail.getNumberOfSelectedValues;
  }

  render() {
    if (
      this.searchStatus.state.hasError ||
      !this.searchStatus.state.hasResults ||
      !this.hasValues
    ) {
      return <Hidden></Hidden>;
    }

    if (!this.searchStatus.state.firstSearchExecuted) {
      return (
        <div
          part="placeholder"
          aria-hidden
          class="h-10 w-24 mr-1.5 my-2 bg-neutral animate-pulse rounded"
        ></div>
      );
    }

    return (
      <div
        id={this.popoverId}
        part="popover-wrapper"
        class="popover-wrapper relative"
      >
        {this.renderValueButton()}
        <div
          part="slot-wrapper"
          class={`absolute pt-2 z-10 ${
            this.isMenuVisible ? 'block' : 'hidden'
          }`}
        >
          <slot></slot>
        </div>
      </div>
    );
  }
}
