import {Component, h, State, Element} from '@stencil/core';
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
import {Hidden} from '../common/hidden';

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
  // The ResizeObserver was being updated on all renders, causing infinite loop type issues
  // private resizeObserver!: ResizeObserver;
  public facetManager!: FacetManager;

  @Element() private host!: HTMLElement;

  @BindStateToController('breadcrumbManager', {
    // Everytime the number of available breadcrumb changes, we have to reset the loop
    onUpdateCallbackMethod: 'resetBreadcrumbs',
  })
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetManager')
  @State()
  public facetManagerState!: FacetManagerState;
  @State() public error!: Error;
  @State() private isCollapsed = true;
  @State() private visibleBreadcrumbs: Breadcrumb[] = [];

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
    window.addEventListener('resize', () => {
      this.resetBreadcrumbs();
    });
  }

  public disconnectedCallback() {
    // [remove window event listener]
  }

  public componentDidRender() {
    if (this.isOverflowing && this.visibleBreadcrumbs.length > 1) {
      this.visibleBreadcrumbs = this.visibleBreadcrumbs.slice(0, -1);
    }
  }

  public resetBreadcrumbs() {
    this.visibleBreadcrumbs = this.allBreadcrumbs;
  }

  private get isOverflowing() {
    const listElement = this.host.shadowRoot!.querySelector('ul');
    if (!listElement) {
      return false;
    }
    return listElement.scrollWidth > listElement.clientWidth;
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
      <li class="breadcrumb" key={value}>
        <Button
          part="breadcrumb-button"
          style="outline-neutral"
          class="py-2 px-3 flex items-baseline btn-pill"
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

  private renderShowMore() {
    const value = this.allBreadcrumbs.length - this.visibleBreadcrumbs.length;
    if (!value) {
      return;
    }

    return (
      <li key="show-more">
        <Button
          part="show-more"
          style="outline-primary"
          class="p-2 btn-pill whitespace-nowrap"
          onClick={() => (this.isCollapsed = false)}
          ariaLabel={this.bindings.i18n.t('show-n-more-filters', {
            value,
          })}
          text={`+ ${value.toLocaleString(this.bindings.i18n.language)}`}
        ></Button>
      </li>
    );
  }

  private renderShowLess() {
    return (
      <li key="show-less">
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
      <li key="clear-all">
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
    const sortedBreadcrumbs = this.visibleBreadcrumbs.sort((a, b) => {
      const indexA = this.facetManagerState.facetIds.indexOf(a.facetId);
      const indexB = this.facetManagerState.facetIds.indexOf(b.facetId);
      return indexA - indexB;
    });

    return [
      sortedBreadcrumbs.map((breadcrumb) => this.renderBreadcrumb(breadcrumb)),
      this.isCollapsed && this.renderShowMore(),
      !this.isCollapsed && this.renderShowLess(),
      this.renderClearAll(),
    ];
  }

  public render() {
    if (!this.visibleBreadcrumbs.length) {
      return <Hidden></Hidden>;
    }

    return (
      <div class="text-on-background text-sm flex">
        <span part="label" class="font-bold p-2 pl-0 with-colon">
          {this.bindings.i18n.t('filters')}
        </span>
        <div class="relative flex-grow">
          <ul
            class={`flex gap-1 ${
              this.isCollapsed
                ? 'flex-nowrap overflow-hidden absolute w-full'
                : 'flex-wrap'
            }`}
          >
            {this.renderBreadcrumbs()}
          </ul>
        </div>
      </div>
    );
  }
}
