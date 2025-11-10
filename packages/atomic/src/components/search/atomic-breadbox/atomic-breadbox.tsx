import {NumberValue, Schema} from '@coveo/bueno';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  buildBreadcrumbManager,
  FacetManager,
  FacetManagerState,
  buildFacetManager,
} from '@coveo/headless';
import {Component, h, State, Element, Prop} from '@stencil/core';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {
  InitializableComponent,
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FocusTargetController} from '../../../utils/stencil-accessibility-utils';
import {Breadcrumb as BreadboxBreadcrumb} from '../../common/breadbox/breadcrumb-types';
import {BreadcrumbButton} from '../../common/breadbox/stencil-breadcrumb-button';
import {BreadcrumbClearAll} from '../../common/breadbox/stencil-breadcrumb-clear-all';
import {BreadcrumbContainer} from '../../common/breadbox/stencil-breadcrumb-container';
import {BreadcrumbContent} from '../../common/breadbox/stencil-breadcrumb-content';
import {BreadcrumbShowLess} from '../../common/breadbox/stencil-breadcrumb-show-less';
import {BreadcrumbShowMore} from '../../common/breadbox/stencil-breadcrumb-show-more';
import {Hidden} from '../../common/stencil-hidden';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-breadbox` component helps the user keep track of the navigational state of the currently active facet values, located in a single place on the search page.
 * In most cases, these are on the top of a page between the search bar and the results.
 * By default, the field name is displayed before the field value to clarify which facet the value is from.
 * You can clear a single selection by clicking the `x` inside of each pill, or clear all selections by using the `Clear` button.
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
 */
@Component({
  tag: 'atomic-breadbox',
  styleUrl: 'atomic-breadbox.pcss',
  shadow: true,
})
export class AtomicBreadbox implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private breadcrumbManager!: BreadcrumbManager;
  private resizeObserver?: ResizeObserver;
  private showMore!: HTMLButtonElement;
  private showLess!: HTMLButtonElement;
  private lastRemovedBreadcrumbIndex = 0;
  private numberOfBreadcrumbs = 0;
  private numberOfCollapsedBreadcrumbs = 0;
  private firstExpandedBreadcrumbIndex?: number;
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
    this.breadcrumbManager = buildBreadcrumbManager(this.bindings.engine);
    this.facetManager = buildFacetManager(this.bindings.engine);

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

  private get facetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.facetBreadcrumbs
      .map(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .flat()
      .filter(({facetId}) => this.bindings.store.state.facets[facetId])
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

  private get categoryFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.categoryFacetBreadcrumbs.map(
      ({facetId, field, path, deselect}) => ({
        facetId,
        label: this.bindings.store.state.categoryFacets[facetId].label(),
        deselect: deselect,
        formattedValue: path.map((pathValue) =>
          getFieldValueCaption(field, pathValue.value, this.bindings.i18n)
        ),
      })
    );
  }

  private get numericFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.numericFacetBreadcrumbs
      .map(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
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

  private get dateFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.dateFacetBreadcrumbs
      .map(({facetId, field, values}) =>
        values.map((value) => ({value, facetId, field}))
      )
      .flat()
      .map(({value, facetId}) => ({
        facetId,
        label: this.bindings.store.state.dateFacets[facetId].label(),
        state: value.value.state,
        deselect: value.deselect,
        formattedValue: [
          this.bindings.store.state.dateFacets[facetId].format(value.value),
        ],
      }));
  }

  private get automaticFacetBreadcrumbs(): BreadboxBreadcrumb[] {
    return this.breadcrumbManagerState.automaticFacetBreadcrumbs
      .flatMap(({facetId, field, label, values}) =>
        values.map((value) => ({value, facetId, field, label}))
      )
      .map(({value, facetId, field, label}) => ({
        facetId,
        state: value.value.state,
        label: label ? label : field,
        deselect: value.deselect,
        formattedValue: [
          getFieldValueCaption(field, value.value.value, this.bindings.i18n),
        ],
      }));
  }

  private get allBreadcrumbs(): BreadboxBreadcrumb[] {
    return [
      ...this.facetBreadcrumbs,
      ...this.categoryFacetBreadcrumbs,
      ...this.numericFacetBreadcrumbs,
      ...this.dateFacetBreadcrumbs,
      ...this.automaticFacetBreadcrumbs,
    ];
  }

  private renderBreadcrumbs(allBreadcrumbs: BreadboxBreadcrumb[]) {
    const sortedBreadcrumbs = allBreadcrumbs.sort((a, b) => {
      const indexA = this.facetManagerState.facetIds.indexOf(a.facetId);
      const indexB = this.facetManagerState.facetIds.indexOf(b.facetId);
      return indexA - indexB;
    });
    this.numberOfBreadcrumbs = sortedBreadcrumbs.length;

    return [
      sortedBreadcrumbs.map((breadcrumb, index) => {
        const isLastBreadcrumb = this.allBreadcrumbs.length === 1;
        return (
          <BreadcrumbButton
            setRef={(ref) => {
              if (this.lastRemovedBreadcrumbIndex === index) {
                this.focusTargets.breadcrumbRemovedFocus.setTarget(ref);
              }
              if (this.firstExpandedBreadcrumbIndex === index) {
                this.focusTargets.breadcrumbShowMoreFocus.setTarget(ref);
              }
            }}
            pathLimit={this.pathLimit}
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
            i18n={this.bindings.i18n}
          >
            <BreadcrumbContent
              pathLimit={this.pathLimit}
              isCollapsed={this.isCollapsed}
              i18n={this.bindings.i18n}
              breadcrumb={breadcrumb}
            ></BreadcrumbContent>
          </BreadcrumbButton>
        );
      }),
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
        i18n={this.bindings.i18n}
      >
        {this.renderBreadcrumbs(allBreadcrumbs)}
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
          i18n={this.bindings.i18n}
          numberOfCollapsedBreadcrumbs={this.numberOfCollapsedBreadcrumbs}
        ></BreadcrumbShowMore>
        <BreadcrumbShowLess
          setRef={(el) => {
            this.showLess = el;
          }}
          onShowLess={() => {
            this.focusTargets.breadcrumbShowLessFocus.focusOnNextTarget();
            this.isCollapsed = true;
          }}
          isCollapsed={this.isCollapsed}
          i18n={this.bindings.i18n}
        ></BreadcrumbShowLess>
        <BreadcrumbClearAll
          setRef={() => {
            const isFocusTarget =
              this.lastRemovedBreadcrumbIndex === this.numberOfBreadcrumbs;

            isFocusTarget
              ? this.focusTargets.breadcrumbRemovedFocus.setTarget
              : undefined;
          }}
          onClick={async () => {
            this.breadcrumbManager.deselectAll();
            this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
          }}
          isCollapsed={this.isCollapsed}
          i18n={this.bindings.i18n}
        ></BreadcrumbClearAll>
      </BreadcrumbContainer>
    );
  }

  public componentDidRender() {
    this.adaptBreadcrumbs();
  }
}
