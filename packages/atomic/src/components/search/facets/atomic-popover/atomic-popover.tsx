import {
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, Listen, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {Hidden} from '../../../common/hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

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

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  renderValueButton() {
    return <Button style="square-neutral">Test</Button>;
  }

  @Listen('facetInitialized')
  addClass(event: CustomEvent<HTMLElement>) {
    console.log(
      'facet initialized!!',
      event.detail.shadowRoot!.querySelector('[part="facet"]'),
      event.detail.shadowRoot
    );
    if (!event.detail.shadowRoot) {
      return;
    }

    const facetContainer =
      event.detail.shadowRoot.querySelector('[part="facet"]');

    if (!facetContainer) {
      return;
    }

    facetContainer.setAttribute(
      'class',
      facetContainer.className + ' popover-nested'
    );
  }

  render() {
    if (this.searchStatus.state.hasError) {
      return <Hidden></Hidden>;
    }

    return (
      <div part="popover-wrapper" class="flex relative">
        {this.renderValueButton()}
        <slot></slot>
      </div>
    );
  }
}
