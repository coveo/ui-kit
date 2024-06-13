import {NumberValue, Schema} from '@coveo/bueno';
import {FacetValueState} from '@coveo/headless';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  FacetGenerator,
  FacetGeneratorState,
  ProductListing,
  ProductListingState,
  Search,
  SearchState,
  buildProductListing,
  buildSearch,
  NumericFacetValue,
  RegularFacetValue,
  DateFacetValue,
  Breadcrumb,
  CategoryFacetValue,
} from '@coveo/headless/commerce';
import {Component, h, State, Element, VNode, Prop} from '@stencil/core';
import CloseIcon from '../../../images/close.svg';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {
  InitializableComponent,
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Button} from '../../common/button';
import {Hidden} from '../../common/hidden';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

interface IBreadcrumb {
  facetId: string;
  label: string;
  formattedValue: string[];
  state?: FacetValueState;
  content?: VNode;
  deselect: () => void;
}

const SEPARATOR = ' / ';
const ELLIPSIS = '...';

/**
 * The `atomic-breadbox` component creates breadcrumbs that display a summary of the currently active facet values.
 *
 * @part container - The container of the whole component, list & label.
 * @part breadcrumb-list-container - The container of the list of breadcrumb buttons.
 * @part breadcrumb-list - The list of breadcrumb buttons.
 * @part breadcrumb-button - A single breadcrumb button.
 * @part breadcrumb-label - The breadcrumb label, associated with the facet.
 * @part breadcrumb-value - The breadcrumb formatted value.
 * @part breadcrumb-clear - The button to clear individual filters.
 * @part show-more - The button to display all breadcrumbs.
 * @part show-less - The button to display less breadcrumbs.
 * @part label - The "Filters" label.
 * @part clear - The button to clear all filters.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-breadbox',
  styleUrl: 'atomic-commerce-breadbox.pcss',
  shadow: true,
})
export class AtomicCommerceBreadbox
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public productListing!: ProductListing;
  public search!: Search;
  private breadcrumbManager!: BreadcrumbManager;
  private resizeObserver?: ResizeObserver;
  private showMore!: HTMLButtonElement;
  private showLess!: HTMLButtonElement;
  private lastRemovedBreadcrumbIndex = 0;
  private numberOfBreadcrumbs = 0;
  private numberOfCollapsedBreadcrumbs = 0;
  private firstExpandedBreadcrumbIndex?: number;
  facetGenerator!: FacetGenerator;

  @Element() private host!: HTMLElement;

  @BindStateToController('productListing')
  @State()
  private productListingState!: ProductListingState;
  @BindStateToController('search')
  @State()
  private searchState!: SearchState;
  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetManager')
  @State()
  public facetGeneratorState!: FacetGeneratorState;
  @State() public error!: Error;
  @State() private isCollapsed = true;

  private breadcrumbRemovedFocus?: FocusTargetController;

  private breadcrumbShowMoreFocus?: FocusTargetController;

  private breadcrumbShowLessFocus?: FocusTargetController;

  /**
   * This prop allows you to control the display depth
   * of the path by specifying the number of parent or ancestor
   * breadcrumbs links relative to the currently selected value.
   *
   * If the path size is equal to or less than the pathLimit, all values in
   * the path will be displayed without truncation.
   *
   * If the path size exceeds the pathLimit, it will truncate the path by
   * replacing the middle values with ellipses ('...').
   *
   * Minimum: `1`
   * @defaultValue `3`
   */
  @Prop() public pathLimit = 3;

  public initialize() {
    this.validateProps();

    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.productListing = buildProductListing(this.bindings.engine);
      this.productListing.refresh();
    } else {
      this.search = buildSearch(this.bindings.engine);
    }
    const parentController =
      this.bindings.interfaceElement.type === 'product-listing'
        ? this.productListing
        : this.search;

    this.breadcrumbManager = parentController.breadcrumbManager();
    this.facetGenerator = parentController.facetGenerator();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.adaptBreadcrumbs());
      this.resizeObserver.observe(this.host.parentElement!);
    }
  }

  get productState() {
    return this.bindings.interfaceElement.type === 'product-listing'
      ? this.productListingState
      : this.searchState;
  }

  private validateProps() {
    new Schema({
      pathLimit: new NumberValue({
        default: 3,
        min: 1,
        required: false,
      }),
    }).validate({
      pathLimit: this.pathLimit,
    });
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  private get focusTargets() {
    if (!this.breadcrumbRemovedFocus) {
      this.breadcrumbRemovedFocus = new FocusTargetController(this);
    }
    if (!this.breadcrumbShowLessFocus) {
      this.breadcrumbShowLessFocus = new FocusTargetController(this);
    }
    if (!this.breadcrumbShowMoreFocus) {
      this.breadcrumbShowMoreFocus = new FocusTargetController(this);
    }
    return {
      breadcrumbRemovedFocus: this.breadcrumbRemovedFocus,
      breadcrumbShowLessFocus: this.breadcrumbShowLessFocus,
      breadcrumbShowMoreFocus: this.breadcrumbShowMoreFocus,
    };
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

  private updateShowLessDisplay() {
    this.show(this.showLess);
    if (this.showLess.offsetTop === 0) {
      this.hide(this.showLess);
    }
  }

  private adaptBreadcrumbs() {
    if (!this.breadcrumbs.length) {
      return;
    }
    this.showAllBreadcrumbs();

    if (!this.isCollapsed) {
      this.updateShowLessDisplay();
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
    if (path.length <= this.pathLimit) {
      return path.join(SEPARATOR);
    }

    if (this.pathLimit === 1 && path.length > 1) {
      return [ELLIPSIS, path[path.length - 1]].join(SEPARATOR);
    }

    const ellipsedPath = [
      path[0],
      ELLIPSIS,
      ...path.slice(-(this.pathLimit - 1)),
    ];
    return ellipsedPath.join(SEPARATOR);
  }

  private renderBreadcrumb(
    breadcrumb: IBreadcrumb,
    index: number,
    totalBreadcrumbs: number
  ) {
    const classNames = [
      'py-2',
      'px-3',
      'flex',
      'items-center',
      'btn-pill',
      'group',
    ];

    const fullValue = Array.isArray(breadcrumb.formattedValue)
      ? breadcrumb.formattedValue.join(SEPARATOR)
      : breadcrumb.formattedValue;
    const value = Array.isArray(breadcrumb.formattedValue)
      ? this.limitPath(breadcrumb.formattedValue)
      : breadcrumb.formattedValue;
    const title = `${breadcrumb.label}: ${fullValue}`;
    const isLastBreadcrumb = totalBreadcrumbs === 1;
    const isExclusion = breadcrumb.state === 'excluded';
    const activeColor = isExclusion ? 'error' : 'primary';

    return (
      <li class="breadcrumb" key={value}>
        <Button
          part="breadcrumb-button"
          style={isExclusion ? 'outline-error' : 'outline-bg-neutral'}
          class={classNames.join(' ')}
          title={title}
          // TODO: [KIT-2939] Replace `remove-filter-on` by `remove-include-filter-on`.
          ariaLabel={this.bindings.i18n.t(
            isExclusion ? 'remove-exclusion-filter-on' : 'remove-filter-on',
            {
              value: title,
            }
          )}
          onClick={() => {
            if (isLastBreadcrumb) {
              this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
            } else if (this.numberOfBreadcrumbs > 1) {
              this.focusTargets.breadcrumbRemovedFocus.focusAfterSearch();
            }

            this.lastRemovedBreadcrumbIndex = index;
            breadcrumb.deselect();
          }}
          ref={(ref) => {
            if (this.lastRemovedBreadcrumbIndex === index) {
              this.focusTargets.breadcrumbRemovedFocus.setTarget(ref);
            }
            if (this.firstExpandedBreadcrumbIndex === index) {
              this.focusTargets.breadcrumbShowMoreFocus.setTarget(ref);
            }
          }}
        >
          <span
            part="breadcrumb-label"
            class={`max-w-snippet truncate group-hover:text-${activeColor} group-focus-visible:text-${activeColor} ${breadcrumb.state}`}
          >
            {this.bindings.i18n.t('with-colon', {text: breadcrumb.label})}
          </span>
          <span
            part="breadcrumb-value"
            class={
              breadcrumb.content
                ? ''
                : `max-w-snippet truncate ${breadcrumb.state}`
            }
          >
            {breadcrumb.content ?? value}
          </span>
          <atomic-icon
            part="breadcrumb-clear"
            class="w-2.5 h-2.5 ml-2 mt-px"
            icon={CloseIcon}
          ></atomic-icon>
        </Button>
      </li>
    );
  }

  private updateShowMoreValue(value: number) {
    this.numberOfCollapsedBreadcrumbs = value;
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
          ref={(ref) => {
            this.focusTargets.breadcrumbShowLessFocus.setTarget(ref!);
            this.showMore = ref!;
          }}
          part="show-more"
          style="outline-primary"
          class="p-2 btn-pill whitespace-nowrap"
          onClick={() => {
            this.firstExpandedBreadcrumbIndex =
              this.numberOfBreadcrumbs - this.numberOfCollapsedBreadcrumbs;
            this.focusTargets.breadcrumbShowMoreFocus.focusOnNextTarget();
            this.isCollapsed = false;
          }}
        ></Button>
      </li>
    );
  }

  private renderShowLess() {
    return (
      <li key="show-less">
        <Button
          ref={(ref) => (this.showLess = ref!)}
          part="show-less"
          style="outline-primary"
          text={this.bindings.i18n.t('show-less')}
          class="p-2 btn-pill"
          onClick={() => {
            this.focusTargets.breadcrumbShowLessFocus.focusOnNextTarget();
            this.isCollapsed = true;
          }}
        ></Button>
      </li>
    );
  }

  private renderClearAll() {
    const isFocusTarget =
      this.lastRemovedBreadcrumbIndex === this.numberOfBreadcrumbs;
    return (
      <li key="clear-all">
        <Button
          part="clear"
          style="text-primary"
          text={this.bindings.i18n.t('clear')}
          class="p-2 btn-pill"
          ariaLabel={this.bindings.i18n.t('clear-all-filters')}
          onClick={async () => {
            this.breadcrumbManager.deselectAll();
            this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
          }}
          ref={
            isFocusTarget
              ? this.focusTargets.breadcrumbRemovedFocus.setTarget
              : undefined
          }
        ></Button>
      </li>
    );
  }

  private get facetBreadcrumbs(): IBreadcrumb[] {
    return (
      this.breadcrumbManagerState.facetBreadcrumbs.filter(
        ({facetId, type}) =>
          this.bindings.store.state.facets[facetId] && type === 'regular'
      ) as Breadcrumb<RegularFacetValue>[]
    )
      .map(({facetId, field, values, type}) =>
        values.map((value) => ({value, facetId, field, type}))
      )
      .flat()
      .map(({value, facetId, field}) => ({
        facetId,
        label: this.bindings.store.state.facets[facetId]?.label(),
        state: value.value.state,
        deselect: value.deselect,
        formattedValue: [
          getFieldValueCaption(field, value.value.value, this.bindings.i18n),
        ],
      }));
  }

  private get categoryFacetBreadcrumbs(): IBreadcrumb[] {
    return (
      this.breadcrumbManagerState.facetBreadcrumbs.filter(
        ({facetId, type}) =>
          this.bindings.store.state.categoryFacets[facetId] &&
          type === 'hierarchical'
      ) as Breadcrumb<CategoryFacetValue>[]
    ).map(({facetId, field, values}) => {
      const deselectAll = () => {
        values.forEach((value) => value.deselect());
      };
      return {
        facetId,
        label: this.bindings.store.state.categoryFacets[facetId].label(),
        deselect: deselectAll,
        formattedValue: values.map((pathValue) =>
          getFieldValueCaption(field, pathValue.value.value, this.bindings.i18n)
        ),
      };
    });
  }

  private get numericFacetBreadcrumbs(): IBreadcrumb[] {
    return (
      this.breadcrumbManagerState.facetBreadcrumbs.filter(({facetId, type}) => {
        this.bindings.store.state.numericFacets[facetId] &&
          type === 'numericalRange';
      }) as Breadcrumb<NumericFacetValue>[]
    )
      .map(({facetId, field, values, type}) =>
        values.map((value) => ({value, facetId, field, type}))
      )
      .flat()
      .map(({value, facetId}) => ({
        facetId,
        label: this.bindings.store.state.numericFacets[facetId].label(),
        state: value.value.state,
        deselect: value.deselect,
        formattedValue: [
          this.bindings.store.state.numericFacets[facetId].format(value.value),
        ],
        content: this.bindings.store.state.numericFacets[facetId].content?.(
          value.value
        ),
      }));
  }

  private get dateFacetBreadcrumbs(): IBreadcrumb[] {
    return (
      this.breadcrumbManagerState.facetBreadcrumbs.filter(
        ({facetId, type}) =>
          this.bindings.store.state.dateFacets[facetId] && type === 'dateRange'
      ) as Breadcrumb<DateFacetValue>[]
    )
      .map(({facetId, field, values, type}) =>
        values.map((value) => ({value, facetId, field, type}))
      )
      .flat()
      .map(({value, facetId}) => ({
        facetId,
        label: this.bindings.store.state.dateFacets[facetId].label(),
        state: value.value.state,
        deselect: value.deselect,
        formattedValue: [
          this.bindings.store.state.dateFacets[facetId].format(
            value.value as DateFacetValue
          ),
        ],
      }));
  }

  private get allBreadcrumbs(): IBreadcrumb[] {
    return [
      ...this.facetBreadcrumbs,
      ...this.categoryFacetBreadcrumbs,
      ...this.numericFacetBreadcrumbs,
      ...this.dateFacetBreadcrumbs,
    ];
  }

  private renderBreadcrumbs(allBreadcrumbs: IBreadcrumb[]) {
    const sortedBreadcrumbs = allBreadcrumbs.sort((a, b) => {
      const indexA = this.facetGenerator.state.indexOf(a.facetId);
      const indexB = this.facetGenerator.state.indexOf(b.facetId);
      return indexA - indexB;
    });
    this.numberOfBreadcrumbs = sortedBreadcrumbs.length;

    return [
      sortedBreadcrumbs.map((breadcrumb, i) =>
        this.renderBreadcrumb(breadcrumb, i, allBreadcrumbs.length)
      ),
      this.isCollapsed && this.renderShowMore(),
      !this.isCollapsed && this.renderShowLess(),
      this.renderClearAll(),
    ];
  }

  public render() {
    const allBreadcrumbs = this.allBreadcrumbs;

    if (!allBreadcrumbs.length) {
      return <Hidden></Hidden>;
    }

    return (
      <div part="container" class="flex text-sm text-on-background">
        <span part="label" class="font-bold py-[0.625rem] pl-0 pr-2">
          {this.bindings.i18n.t('with-colon', {
            text: this.bindings.i18n.t('filters'),
          })}
        </span>
        <div part="breadcrumb-list-container" class="relative grow">
          <ul
            part="breadcrumb-list"
            class={`flex gap-1 ${
              this.isCollapsed ? 'flex-nowrap absolute w-full' : 'flex-wrap'
            }`}
          >
            {this.renderBreadcrumbs(allBreadcrumbs)}
          </ul>
        </div>
      </div>
    );
  }

  public componentDidRender() {
    this.adaptBreadcrumbs();
  }
}
