import {Component, h, State, Prop, Host} from '@stencil/core';
import {
  Bindings,
  InitializableComponent,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  buildBreadcrumbManager,
} from '@coveo/headless';

/**
 * The `atomic-breadcrumb-manager` component creates breadcrumbs that display a summary of the currently active facet values.
 *
 * @part breadcrumb-clear-all - The clear all breadcrumbs button.
 * @part breadcrumb-label - Label attribute for the breadcrumb's label.
 * @part breadcrumbs - The list of breadcrumb values following the label.
 * @part breadcrumb - An individual breadcrumb.
 */
@Component({
  tag: 'atomic-breadcrumb-manager-v1', // TODO: remove -v1
  styleUrl: 'atomic-breadcrumb-manager.pcss',
  shadow: true,
})
export class AtomicBreadcrumbManager implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private breadcrumbManager!: BreadcrumbManager;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @State() public error!: Error;

  /**
   * Number of breadcrumbs to display when collapsed.
   */
  @Prop() public collapseThreshold = 5;

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
  }

  public render() {
    if (!this.breadcrumbManagerState.hasBreadcrumbs) {
      return <Host class="atomic-without-values"></Host>;
    }
    return <Host class="atomic-with-values">breadcrumbs here...</Host>;
  }
}
