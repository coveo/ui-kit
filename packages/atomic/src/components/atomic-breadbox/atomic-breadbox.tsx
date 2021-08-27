import {Component, h, State, Host} from '@stencil/core';
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
  formattedValue: string[];
  deselect: () => void;
}

const SEPARATOR = ' / ';
const ELLIPSIS = '...';

/**
 * The `atomic-breadbox` component creates breadcrumbs that display a summary of the currently active facet values.
 *
 * @part breadcrumb-button - A single breadcrumb button.
 * @part breadcrumb-label - The breadcrumb label, associated with the facet.
 * @part breadcrumb-value - The breadcrumb formatted value.
 * @part show-more - The button to display all breadcrumbs.
 * @part show-less - The button to display less breadcrumbs.
 * @part label - The "Filters" label.
 * @part clear - The button to clear all filters.
 */
@Component({
  tag: 'atomic-breadbox',
  styleUrl: 'atomic-breadbox.pcss',
  shadow: true,
})
export class AtomicBreadbox implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private breadcrumbManager!: BreadcrumbManager;
  facetManager!: FacetManager;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetManager')
  @State()
  public facetManagerState!: FacetManagerState;
  @State() public error!: Error;
  @State() private isCollapsed = true;

  // TODO: KIT-924 Automatically adapt the number of element of the breadbox
  private collapseThreshold = 5;

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
  }

  private limitPath(path: string[]) {
    if (path.length <= 3) {
      return path.join(SEPARATOR);
    }

    const ellipsedPath = [path[0], ELLIPSIS, ...path.slice(-2)];
    return ellipsedPath.join(SEPARATOR);
  }

  private renderBreadcrumb(breadcrumb: Breadcrumb) {
    const fullValue = Array.isArray(breadcrumb.formattedValue)
      ? breadcrumb.formattedValue.join(SEPARATOR)
      : breadcrumb.formattedValue;
    const value = Array.isArray(breadcrumb.formattedValue)
      ? this.limitPath(breadcrumb.formattedValue)
      : breadcrumb.formattedValue;

    return (
      <li>
        <Button
          part="breadcrumb-button"
          style="outline-neutral"
          class="py-2 px-3 flex items-center btn-pill"
          title={`${breadcrumb.label}: ${fullValue}`}
          onClick={() => breadcrumb.deselect()}
        >
          <span
            part="breadcrumb-label"
            class="max-w-snippet truncate with-colon text-neutral-dark mr-px"
          >
            {breadcrumb.label}
          </span>
          <span part="breadcrumb-value" class="max-w-snippet truncate">
            {value}
          </span>
          <atomic-icon class="w-2 ml-2" icon={CloseIcon}></atomic-icon>
        </Button>
      </li>
    );
  }

  private renderShowMore(value: number) {
    return (
      <li>
        <Button
          part="show-more"
          style="outline-primary"
          text={`+ ${value.toLocaleString(this.bindings.i18n.language)}`}
          class="p-2 btn-pill"
          ariaLabel={this.bindings.i18n.t('show-n-more-filters', {value})}
          onClick={() => (this.isCollapsed = false)}
        ></Button>
      </li>
    );
  }

  private renderShowLess() {
    return (
      <li>
        <Button
          part="show-less"
          style="outline-primary"
          text={this.bindings.i18n.t('show-less')}
          class="p-2 btn-pill"
          onClick={() => (this.isCollapsed = true)}
        ></Button>
      </li>
    );
  }

  private renderClearAll() {
    return (
      <li>
        <Button
          part="clear"
          style="text-primary"
          text={this.bindings.i18n.t('clear')}
          class="p-2 btn-pill"
          ariaLabel={this.bindings.i18n.t('clear-all-filters')}
          onClick={() => this.breadcrumbManager.deselectAll()}
        ></Button>
      </li>
    );
  }

  private get facetBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbManagerState.facetBreadcrumbs
      .map(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .flat()
      .map(({value, facetId, field}) => ({
        facetId,
        label: this.bindings.store.state.facets[facetId].label,
        deselect: value.deselect,
        formattedValue: [
          getFieldValueCaption(field, value.value.value, this.bindings.i18n),
        ],
      }));
  }

  private get categoryFacetBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbManagerState.categoryFacetBreadcrumbs.map(
      ({facetId, field, path, deselect}) => ({
        facetId,
        label: this.bindings.store.state.categoryFacets[facetId].label,
        deselect: deselect,
        formattedValue: path.map((pathValue) =>
          getFieldValueCaption(field, pathValue.value, this.bindings.i18n)
        ),
      })
    );
  }

  private get numericFacetBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbManagerState.numericFacetBreadcrumbs
      .map(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .flat()
      .map(({value, facetId}) => ({
        facetId,
        label: this.bindings.store.state.numericFacets[facetId].label,
        deselect: value.deselect,
        formattedValue: [
          this.bindings.store.state.numericFacets[facetId].format(value.value),
        ],
      }));
  }

  private get dateFacetBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbManagerState.dateFacetBreadcrumbs
      .map(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .flat()
      .map(({value, facetId}) => ({
        facetId,
        label: this.bindings.store.state.dateFacets[facetId].label,
        deselect: value.deselect,
        formattedValue: [
          this.bindings.store.state.dateFacets[facetId].format(value.value),
        ],
      }));
  }

  private get allBreadcrumbs(): Breadcrumb[] {
    return [
      ...this.facetBreadcrumbs,
      ...this.categoryFacetBreadcrumbs,
      ...this.numericFacetBreadcrumbs,
      ...this.dateFacetBreadcrumbs,
    ];
  }

  private renderBreadcrumbs() {
    const sortedBreadcrumbs = this.allBreadcrumbs.sort((a, b) => {
      const indexA = this.facetManagerState.facetIds.indexOf(a.facetId);
      const indexB = this.facetManagerState.facetIds.indexOf(b.facetId);
      return indexA - indexB;
    });
    const slicedBreadcrumbs = this.isCollapsed
      ? sortedBreadcrumbs.slice(0, this.collapseThreshold)
      : sortedBreadcrumbs;

    // TODO: update collapse KIT-924
    return [
      slicedBreadcrumbs.map((breadcrumb) => this.renderBreadcrumb(breadcrumb)),
      this.isCollapsed &&
        sortedBreadcrumbs.length > this.collapseThreshold &&
        this.renderShowMore(sortedBreadcrumbs.length - this.collapseThreshold),
      slicedBreadcrumbs.length > this.collapseThreshold &&
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
          <span part="label" class="font-bold p-2 pl-0 with-colon">
            {this.bindings.i18n.t('filters')}
          </span>
          <ul class="flex flex-wrap gap-1">{this.renderBreadcrumbs()}</ul>
        </div>
      </Host>
    );
  }
}
