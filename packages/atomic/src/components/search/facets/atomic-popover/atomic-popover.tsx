import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, State, Listen, Element} from '@stencil/core';
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
import {closest} from '../../../../utils/utils';

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
  @State() public facetLabel?: string = 'no-label';
  @Element() host!: HTMLElement;
  private facetElement?: HTMLElement;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  renderValueButton() {
    return (
      <Button
        style="square-neutral"
        onClick={() => (this.isMenuVisible = !this.isMenuVisible)}
        class={`value-button rounded flex box-border h-full items-center p-2 group ${
          this.isMenuVisible
            ? 'selected border-primary shadow-inner-primary'
            : 'hover:border-primary-light focus-visible:border-primary-light'
        }`}
      >
        <span
          title={this.facetLabel}
          part="value-label"
          class={`value-label truncate ${
            this.isMenuVisible
              ? 'text-primary'
              : 'group-hover:text-primary-light group-focus:text-primary'
          }`}
        >
          {this.facetLabel}
        </span>
        <atomic-icon
          class={`w-2.5 ml-2 ${this.isMenuVisible ? 'rotate-180' : ''} `}
          icon={ArrowBottomIcon}
        ></atomic-icon>
      </Button>
    );
  }

  @Listen('facetInitialized')
  injectPopoverClass(event: CustomEvent<InitPopoverEventPayload>) {
    console.log('init!', this.facetElement, event);
    if (this.facetElement) {
      return;
    }

    const facet = this.bindings.store.get(event.detail.facetType)[
      event.detail.facetId
    ];
    console.log('facet', facet);
    if (!facet) {
      // TODO: add error msg
      console.error('no bueno');
      return;
    }

    this.facetElement = facet.element;
    this.facetLabel = facet.label;
    this.facetElement.classList.add('popover-nested');
    this.host.addEventListener('focusout', (e) => this.onFocusOut(e));
    this.facetElement!.addEventListener('focusout', (e) => this.onFocusOut(e));
  }

  private onFocusOut(e: FocusEvent) {
    const target = e.relatedTarget;
    const isHost =
      closest(target! as HTMLElement, 'atomic-popover') === this.host;
    if (!isHost) {
      this.isMenuVisible = false;
    }
  }

  render() {
    if (this.searchStatus.state.hasError) {
      return <Hidden></Hidden>;
    }

    // TODO: hide if facet has 0 values
    // TODO: handle slot error ("Popover can only support one child" if popover has more than 1 child)
    // TODO: add placeholder when facet isn't  ready

    return (
      <div part="popover-wrapper" class="popover-wrapper relative">
        {this.renderValueButton()}
        {this.isMenuVisible && <slot></slot>}
      </div>
    );
  }
}
