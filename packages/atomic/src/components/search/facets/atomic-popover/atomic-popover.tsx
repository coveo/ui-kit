import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
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
import {InitPopoverEventPayload} from './popover-event';

/**
 * @internal
 * The `atomic-popover` displays a popover menu view of any facet
 * @part value-button - The button used to display the popover menu
 * @part value-label - The popover button label.
 * @part arrow-icon - The arrow icon to display or hide the popover menu.
 * @part placeholder - The placeholder displayed when the facet is loading.
 * @part popover-wrapper - The wrapper that contains the 'value-button' and the 'slot-wrapper'.
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
  @State()
  public error!: Error;

  @State() public isMenuVisible = false;
  @State() public facetId?: string;
  @State() public facetLabel?: string = 'no-label';
  @Element() host!: HTMLElement;
  private facetElement?: HTMLElement;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);

    if (this.host.children.length === 0) {
      this.error = {
        name: 'No child in popover',
        message: 'One child is required inside a set of popover tags',
      };
    } else if (this.host.children.length > 1) {
      this.error = {
        name: 'Too many children in popover',
        message: 'Cannot have more than one child inside a set of popover tags',
      };
    }
  }

  popoverOpened() {
    if (!this.isMenuVisible) {
      const popoverOpened = new CustomEvent('popoverOpened', {
        detail: this.facetId,
      });
      document.dispatchEvent(popoverOpened);
    }

    this.isMenuVisible = !this.isMenuVisible;
  }

  @Listen('popoverOpened', {target: 'document'})
  popOpened(event: CustomEvent) {
    if (event.detail !== this.facetId) {
      this.isMenuVisible = false;
    }
  }

  renderValueButton() {
    return (
      <Button
        style="square-neutral"
        onClick={() => this.popoverOpened()}
        part="value-button"
        class={`value-button rounded flex box-border h-full items-center mr-1.5 p-2.5 group ${
          this.isMenuVisible
            ? 'selected border-primary shadow-outer-light-blue text-primary'
            : 'hover:border-primary-light focus-visible:border-primary-light '
        }`}
      >
        <span
          title={this.facetLabel}
          part="value-label"
          class={`value-label truncate ${
            this.isMenuVisible
              ? ''
              : 'group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {this.facetLabel}
        </span>
        <atomic-icon
          part="arrow-icon"
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
  injectPopoverClass(event: CustomEvent<InitPopoverEventPayload>) {
    if (this.facetElement) {
      return;
    }

    const facet = this.bindings.store.get(event.detail.facetType)[
      event.detail.facetId
    ];

    if (!facet) {
      // TODO: add error msg
      console.error('No facet found inside the Store');
      return;
    }

    this.facetElement = facet.element;
    this.facetId = facet.facetId;
    this.facetLabel = facet.label;
    this.facetElement?.classList.add('popover-nested');
  }

  render() {
    if (this.searchStatus.state.hasError) {
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

    //TODO: hide if facet has 0 values (use headless to retrieve facet state)

    return (
      <div part="popover-wrapper" class="popover-wrapper relative">
        {this.renderValueButton()}
        <div
          part="slot-wrapper"
          class={`slot-wrapper absolute pt-2 z-10 hidden ${
            this.isMenuVisible ? 'selected' : ''
          }`}
        >
          <slot></slot>
        </div>
      </div>
    );
  }
}
