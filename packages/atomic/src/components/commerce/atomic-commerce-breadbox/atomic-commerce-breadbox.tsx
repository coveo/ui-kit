import {NumberValue, Schema} from '@coveo/bueno';
import {
  BreadcrumbManagerState,
  BreadcrumbManager,
  ProductListing,
  Search,
  buildProductListing,
  buildSearch,
  NumericFacetValue,
  RegularFacetValue,
  DateFacetValue,
  Breadcrumb,
  CategoryFacetValue,
  BreadcrumbValue,
  Context,
  ContextState,
  buildContext,
  LocationFacetValue,
} from '@coveo/headless/commerce';
import {Component, h, State, Element, Prop} from '@stencil/core';
import {parseDate} from '../../../utils/date-utils';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {
  InitializableComponent,
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FocusTargetController} from '../../../utils/stencil-accessibility-utils';
import {BreadcrumbButton} from '../../common/breadbox/breadcrumb-button';
import {BreadcrumbClearAll} from '../../common/breadbox/breadcrumb-clear-all';
import {BreadcrumbContainer} from '../../common/breadbox/breadcrumb-container';
import {BreadcrumbContent} from '../../common/breadbox/breadcrumb-content';
import {BreadcrumbShowLess} from '../../common/breadbox/breadcrumb-show-less';
import {BreadcrumbShowMore} from '../../common/breadbox/breadcrumb-show-more';
import {Breadcrumb as BreadboxBreadcrumb} from '../../common/breadbox/breadcrumb-types';
import {formatHumanReadable} from '../../common/facets/numeric-facet/formatter';
import {
  defaultCurrencyFormatter,
  defaultNumberFormatter,
} from '../../common/formats/format-common';
import {Hidden} from '../../common/stencil-hidden';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

type AnyFacetValue =
  | RegularFacetValue
  | LocationFacetValue
  | NumericFacetValue
  | DateFacetValue
  | CategoryFacetValue;

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
 * @alpha
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
  breadcrumbManager!: BreadcrumbManager;

  @Element() private host!: HTMLElement;

  public context!: Context;
  @BindStateToController('context') contextState!: ContextState;

  public searchOrListing!: Search | ProductListing;

  @BindStateToController('breadcrumbManager')
  @State()
  private breadcrumbManagerState!: BreadcrumbManagerState;
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

    this.context = buildContext(this.bindings.engine);

    this.breadcrumbManager = this.searchOrListing.breadcrumbManager();

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

  private getNumberFormatter(field: string) {
    if (field === 'ec_price' || field === 'ec_promo_price') {
      return defaultCurrencyFormatter(this.contextState.currency);
    }
    return defaultNumberFormatter;
  }

  private valueForFacetType = (
    type: string,
    field: string,
    value: BreadcrumbValue<AnyFacetValue>
  ): string[] => {
    switch (type) {
      case 'numericalRange':
        return [
          formatHumanReadable({
            facetValue: value.value as NumericFacetValue,
            logger: this.bindings.engine.logger,
            i18n: this.bindings.i18n,
            field: field,
            manualRanges: [],
            formatter: this.getNumberFormatter(field),
          }),
        ];
      case 'dateRange':
        return [
          this.bindings.i18n.t('to', {
            start: parseDate((value.value as DateFacetValue).start).format(
              'YYYY-MM-DD'
            ),
            end: parseDate((value.value as DateFacetValue).end).format(
              'YYYY-MM-DD'
            ),
          }),
        ];
      case 'hierarchical':
        return (value.value as CategoryFacetValue).path.map(
          (pathValue: string) =>
            getFieldValueCaption(field, pathValue, this.bindings.i18n)
        );
      case 'regular':
        return [
          getFieldValueCaption(
            field,
            (value.value as RegularFacetValue).value,
            this.bindings.i18n
          ),
        ];
      default: {
        // TODO COMHUB-291 support location breadcrumb
        this.bindings.engine.logger.warn('Unexpected breadcrumb type.');
        return [];
      }
    }
  };

  private buildBreadcrumb(breadcrumb: Breadcrumb<AnyFacetValue>) {
    return breadcrumb.values.map((value: BreadcrumbValue<AnyFacetValue>) => {
      return {
        facetId: breadcrumb.facetId,
        label: breadcrumb.facetDisplayName,
        deselect: value.deselect,
        formattedValue: this.valueForFacetType(
          breadcrumb.type,
          breadcrumb.facetId,
          value
        ),
      };
    });
  }

  private renderBreadcrumbs(breadcrumbs: BreadboxBreadcrumb[]) {
    this.numberOfBreadcrumbs = breadcrumbs.length;

    return breadcrumbs.map((breadcrumb, index) => {
      const isLastBreadcrumb = breadcrumbs.length === 1;
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
    });
  }

  public render() {
    const breadcrumbs = this.breadcrumbManagerState.facetBreadcrumbs
      .map((breadcrumb) => {
        return this.buildBreadcrumb(breadcrumb);
      })
      .flat();

    if (!breadcrumbs.length) {
      return <Hidden></Hidden>;
    }
    return (
      <BreadcrumbContainer
        isCollapsed={this.isCollapsed}
        i18n={this.bindings.i18n}
      >
        {this.renderBreadcrumbs(breadcrumbs)}
        <BreadcrumbShowMore
          setRef={(el: HTMLButtonElement) => {
            this.focusTargets.breadcrumbShowLessFocus.setTarget(el!);
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
          setRef={(el: HTMLButtonElement) => {
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
