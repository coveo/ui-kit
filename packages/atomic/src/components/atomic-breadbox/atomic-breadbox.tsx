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
import {getFieldValueCaption} from '../../utils/field-utils';

interface Breadcrumb {
  facetId: string;
  label: string;
  formattedValue: string | string[];
  deselect: () => void;
}

const CHARACTER_LIMIT = 30;
const SEPARATOR = '/';
const ELLIPSIS = '...';

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
    return value.length > CHARACTER_LIMIT
      ? `${value.substring(0, CHARACTER_LIMIT)}${ELLIPSIS}`
      : value;
  }

  // TODO: limit path
  private limitPath(path: string[]) {}

  private renderBreadcrumb(breadcrumb: Breadcrumb) {
    const limitedLabel = this.limitLength(breadcrumb.label);
    const fullValue = Array.isArray(breadcrumb.formattedValue)
      ? breadcrumb.formattedValue.join(SEPARATOR)
      : breadcrumb.formattedValue;
    const limitedValue = Array.isArray(breadcrumb.formattedValue)
      ? this.limitPath(breadcrumb.formattedValue)
      : this.limitLength(breadcrumb.formattedValue);

    return (
      <li>
        <Button
          style="outline-neutral"
          class="py-2 px-3 flex items-center btn-pill"
          title={`${breadcrumb.label}: ${fullValue}`}
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

  private get allBreadcrumbs(): Breadcrumb[] {
    return [
      ...this.breadcrumbManagerState.facetBreadcrumbs
        .map(({facetId, field, values}) =>
          values.map((value) => ({value, facetId, field}))
        )
        .flat()
        .map(({value, facetId, field}) => ({
          facetId,
          label: this.bindings.store.state.facets[facetId].label,
          deselect: value.deselect,
          formattedValue: getFieldValueCaption(
            field,
            value.value.value,
            this.bindings.i18n
          ),
        })),
      ...this.breadcrumbManagerState.categoryFacetBreadcrumbs.map(
        ({facetId, field, path, deselect}) => ({
          facetId,
          label: this.bindings.store.state.categoryFacets[facetId].label,
          deselect: deselect,
          formattedValue: path.map((pathValue) =>
            getFieldValueCaption(field, pathValue.value, this.bindings.i18n)
          ),
        })
      ),
      ...this.breadcrumbManagerState.numericFacetBreadcrumbs
        .map(({facetId, field, values}) =>
          values.map((value) => ({value, facetId, field}))
        )
        .flat()
        .map(({value, facetId}) => ({
          facetId,
          label: this.bindings.store.state.numericFacets[facetId].label,
          deselect: value.deselect,
          formattedValue: this.bindings.store.state.numericFacets[
            facetId
          ].format(value.value),
        })),
      ...this.breadcrumbManagerState.dateFacetBreadcrumbs
        .map(({facetId, field, values}) =>
          values.map((value) => ({value, facetId, field}))
        )
        .flat()
        .map(({value, facetId}) => ({
          facetId,
          label: this.bindings.store.state.dateFacets[facetId].label,
          deselect: value.deselect,
          formattedValue: this.bindings.store.state.dateFacets[facetId].format(
            value.value
          ),
        })),
    ];
  }

  private renderBreadcrumbs() {
    // TODO: sort and cut
    const sortedBreadcrumbs = this.allBreadcrumbs;
    return [
      sortedBreadcrumbs.map((breadcrumb) => this.renderBreadcrumb(breadcrumb)),
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
