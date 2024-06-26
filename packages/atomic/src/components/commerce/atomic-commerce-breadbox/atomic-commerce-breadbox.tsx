import {NumberValue, Schema} from '@coveo/bueno';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  FacetGenerator,
  FacetGeneratorState,
  ProductListing,
  Search,
  buildProductListing,
  buildSearch,
  NumericFacetValue,
  RegularFacetValue,
  DateFacetValue,
  Breadcrumb,
  CategoryFacetValue,
} from '@coveo/headless/commerce';
import {Component, h, State, Element, Prop} from '@stencil/core';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {
  InitializableComponent,
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  IBreadcrumb,
  BreadcrumbContainer,
  BreadcrumbButton,
  BreadcrumbShowMore,
  BreadcrumbShowLess,
  BreadcrumbClearAll,
} from '../../common/breadbox/breadbox';
import {Hidden} from '../../common/hidden';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-breadbox` component creates breadcrumbs that display a summary of the currently active facet values.
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

  private resizeObserver?: ResizeObserver;
  private showMore!: HTMLButtonElement;
  private showLess!: HTMLButtonElement;
  private lastRemovedBreadcrumbIndex = 0;
  private numberOfBreadcrumbs = 0;
  private numberOfCollapsedBreadcrumbs = 0;
  private firstExpandedBreadcrumbIndex?: number;
  facetGenerator!: FacetGenerator;
  breadcrumbManager!: BreadcrumbManager;

  @Element() private host!: HTMLElement;

  public searchOrListing!: Search | ProductListing;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
  @BindStateToController('facetGenerator')
  @State()
  public facetGeneratorState!: FacetGeneratorState[];
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
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }

    this.breadcrumbManager = this.searchOrListing.breadcrumbManager();
    this.facetGenerator = this.searchOrListing.facetGenerator();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.adaptBreadcrumbs());
      this.resizeObserver.observe(this.host.parentElement!);
    }
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
        ({facetId, type, values}) => {
          return (
            values.length > 0 &&
            this.bindings.store.state.categoryFacets[facetId] &&
            type === 'hierarchical'
          );
        }
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
      this.breadcrumbManagerState.facetBreadcrumbs.filter(
        ({facetId, type}) =>
          this.bindings.store.state.numericFacets[facetId] &&
          type === 'numericalRange'
      ) as Breadcrumb<NumericFacetValue>[]
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
      sortedBreadcrumbs.map((breadcrumb, index) => {
        const isLastBreadcrumb = this.allBreadcrumbs.length === 1;
        return (
          <BreadcrumbButton
            pathLimit={this.pathLimit}
            focusTargets={this.focusTargets}
            lastRemovedBreadcrumbIndex={this.lastRemovedBreadcrumbIndex}
            firstExpandedBreadcrumbIndex={this.firstExpandedBreadcrumbIndex}
            breadcrumb={breadcrumb}
            onSelectBreadcrumb={() => {
              if (isLastBreadcrumb) {
                this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
              } else if (this.numberOfBreadcrumbs > 1) {
                this.focusTargets.breadcrumbRemovedFocus.focusAfterSearch();
              }

              this.lastRemovedBreadcrumbIndex = index;
              breadcrumb.deselect();
            }}
            index={index}
            bindings={this.bindings}
          ></BreadcrumbButton>
        );
      }),
      <BreadcrumbShowMore
        setRef={(el) => {
          this.showMore = el;
        }}
        onShowMore={() => {
          this.firstExpandedBreadcrumbIndex =
            this.numberOfBreadcrumbs - this.numberOfCollapsedBreadcrumbs;
          this.focusTargets.breadcrumbShowMoreFocus.focusOnNextTarget();
          this.isCollapsed = false;
        }}
        isCollapsed={this.isCollapsed}
        bindings={this.bindings}
        numberOfCollapsedBreadcrumbs={this.numberOfCollapsedBreadcrumbs}
      ></BreadcrumbShowMore>,
      <BreadcrumbShowLess
        setRef={(el) => {
          this.showLess = el;
        }}
        onShowLess={() => {
          this.focusTargets.breadcrumbShowLessFocus.focusOnNextTarget();
          this.isCollapsed = true;
        }}
        isCollapsed={this.isCollapsed}
        bindings={this.bindings}
      ></BreadcrumbShowLess>,
      <BreadcrumbClearAll
        onClick={async () => {
          this.breadcrumbManager.deselectAll();
          this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
        }}
        numberOfBreadcrumbs={this.numberOfBreadcrumbs}
        focusTargets={this.focusTargets}
        isCollapsed={this.isCollapsed}
        bindings={this.bindings}
        lastRemovedBreadcrumbIndex={this.lastRemovedBreadcrumbIndex}
      ></BreadcrumbClearAll>,
    ];
  }

  public render() {
    const allBreadcrumbs = this.allBreadcrumbs;

    if (!allBreadcrumbs.length) {
      return <Hidden></Hidden>;
    }
    return (
      <BreadcrumbContainer
        isCollapsed={this.isCollapsed}
        bindings={this.bindings}
      >
        {this.renderBreadcrumbs(allBreadcrumbs)}
      </BreadcrumbContainer>
    );
  }

  public componentDidRender() {
    this.adaptBreadcrumbs();
  }
}
