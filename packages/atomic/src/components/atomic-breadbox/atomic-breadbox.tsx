import {Component, h, State, Element, VNode} from '@stencil/core';
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
  content?: VNode;
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
  private resizeObserver!: ResizeObserver;
  private showMore!: HTMLButtonElement;
  facetManager!: FacetManager;

  @Element() private host!: HTMLElement;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetManager')
  @State()
  public facetManagerState!: FacetManagerState;
  @State() public error!: Error;
  @State() private isCollapsed = true;

  public initialize() {
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);
    this.resizeObserver = new ResizeObserver(() => this.adaptBreadcrumbs());
    this.resizeObserver.observe(this.host.parentElement!);
  }

  public disconnectedCallback() {
    this.resizeObserver.disconnect();
  }

  private get breadcrumbs() {
    return Array.from(
      this.host.shadowRoot!.querySelectorAll('li.breadcrumb')
    ) as HTMLElement[];
  }

  private hide(element: HTMLElement) {
    element.style.display = 'none';
  }

  private show(element: HTMLElement) {
    element.style.display = '';
  }

  private showAllBreadcrumbs() {
    this.breadcrumbs.forEach((breadcrumb) => this.show(breadcrumb));
  }

  private hideOverflowingBreadcrumbs() {
    let hiddenBreadcrumbs = 0;
    for (
      let i = this.breadcrumbs.length - 1;
      this.isOverflowing && i >= 0;
      i--
    ) {
      this.hide(this.breadcrumbs[i]);
      hiddenBreadcrumbs++;
    }
    this.updateShowMoreValue(hiddenBreadcrumbs);
  }

  private adaptBreadcrumbs() {
    if (!this.breadcrumbs.length) {
      return;
    }
    this.showAllBreadcrumbs();
    if (!this.isCollapsed) {
      return;
    }

    this.updateShowMoreValue(this.breadcrumbs.length);
    this.hideOverflowingBreadcrumbs();
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
          style="outline-bg-neutral"
          class="py-2 px-3 flex items-center btn-pill group"
          title={`${breadcrumb.label}: ${fullValue}`}
          onClick={() => breadcrumb.deselect()}
        >
          <span
            part="breadcrumb-label"
            class="max-w-snippet truncate with-colon text-neutral-dark mr-0.5 group-hover:text-primary group-focus:text-primary"
          >
            {breadcrumb.label}
          </span>
          <span
            part="breadcrumb-value"
            class={breadcrumb.content ? '' : 'max-w-snippet truncate'}
          >
            {breadcrumb.content ?? value}
          </span>
          <atomic-icon
            class="w-2.5 h-2.5 ml-2 mt-px"
            icon={CloseIcon}
          ></atomic-icon>
        </Button>
      </li>
    );
  }

  private updateShowMoreValue(value: number) {
    if (value === 0) {
      this.hide(this.showMore);
      return;
    }

    this.show(this.showMore);
    this.showMore.textContent = `+ ${value.toLocaleString(
      this.bindings.i18n.language
    )}`;

    this.showMore.setAttribute(
      'aria-label',
      this.bindings.i18n.t('show-n-more-filters', {
        value,
      })
    );
  }

  private renderShowMore() {
    return (
      <li key="show-more">
        <Button
          ref={(ref) => (this.showMore = ref!)}
          part="show-more"
          style="outline-primary"
          class="p-2 btn-pill whitespace-nowrap"
          onClick={() => (this.isCollapsed = false)}
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
        content: this.bindings.store.state.numericFacets[facetId].content?.(
          value.value
        ),
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

    return [
      sortedBreadcrumbs.map((breadcrumb) => this.renderBreadcrumb(breadcrumb)),
      this.isCollapsed && this.renderShowMore(),
      !this.isCollapsed && this.renderShowLess(),
      this.renderClearAll(),
    ];
  }

  public render() {
    if (!this.breadcrumbManagerState.hasBreadcrumbs) {
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

  public componentDidRender() {
    this.adaptBreadcrumbs();
  }
}
