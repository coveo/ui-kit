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
  FacetManager,
  FacetManagerState,
  buildFacetManager,
} from '@coveo/headless';
import {Button} from '../common/button';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';

/**
 * The `atomic-breadbox` component creates breadcrumbs that display a summary of the currently active facet values.
 */
@Component({
  tag: 'atomic-breadbox',
  styleUrl: 'atomic-breadbox.pcss',
  shadow: true,
})
export class AtomicBreadbox implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private breadcrumbManager!: BreadcrumbManager;
  private facetManager!: FacetManager;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetManager')
  @State()
  public facetManagerState!: FacetManagerState;
  @State() public error!: Error;

  /**
   * Number of breadcrumbs to display when collapsed.
   */
  @Prop() public collapseThreshold = 5;

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
  }

  private limitLength(value: string) {
    const length = 30;
    return value.length > length ? `${value.substring(0, length)}...` : value;
  }

  private renderBreadcrumb() {
    const limitedLabel = this.limitLength('Brand');
    const limitedValue = this.limitLength('Adidas');
    return (
      <li>
        <Button
          style="outline-neutral"
          class="py-2 px-3 flex items-center btn-pill"
          title={`${'Brand'}: ${'Adidas'}`}
        >
          <span class="with-colon text-neutral-dark mr-px">{limitedLabel}</span>
          <span>{limitedValue}</span>
          <atomic-icon class="w-2 ml-2" icon={CloseIcon}></atomic-icon>
        </Button>
      </li>
    );
  }

  private renderShowMore(value: number) {
    return (
      <li>
        <Button
          style="outline-primary"
          text={`+ ${value.toLocaleString(this.bindings.i18n.language)}`}
          class="p-2 btn-pill"
          ariaLabel={this.bindings.i18n.t('show-n-more-filters', {value})}
        ></Button>
      </li>
    );
  }

  private renderShowLess() {
    return (
      <li>
        <Button
          style="outline-primary"
          text={this.bindings.i18n.t('show-less')}
          class="p-2 btn-pill"
        ></Button>
      </li>
    );
  }

  private renderClearAll() {
    return (
      <li>
        <Button
          style="text-primary"
          text={this.bindings.i18n.t('clear')}
          class="p-2 btn-pill"
          ariaLabel={this.bindings.i18n.t('clear-all-filters')}
          onClick={() => this.breadcrumbManager.deselectAll()}
        ></Button>
      </li>
    );
  }

  private renderBreadcrumbs() {
    // TODO: loop, sort and cut
    return [
      this.renderBreadcrumb(),
      this.renderShowMore(15),
      this.renderShowLess(),
      this.renderClearAll(),
    ];
  }

  public render() {
    if (!this.breadcrumbManagerState.hasBreadcrumbs) {
      return <Host class="atomic-without-values"></Host>;
    }
    return (
      <Host class="atomic-with-values">
        <div class="text-on-background text-sm flex">
          <span part="filters-label" class="font-bold p-2 with-colon">
            {this.bindings.i18n.t('filters')}
          </span>
          <ul class="flex flex-wrap gap-1">{this.renderBreadcrumbs()}</ul>
        </div>
      </Host>
    );
  }
}
