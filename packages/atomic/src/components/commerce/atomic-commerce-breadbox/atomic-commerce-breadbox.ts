import {NumberValue, Schema} from '@coveo/bueno';
import {
  type Breadcrumb,
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  type BreadcrumbValue,
  buildContext,
  buildProductListing,
  buildSearch,
  type CategoryFacetValue,
  type Context,
  type ContextState,
  type DateFacetValue,
  type LocationFacetValue,
  type NumericFacetValue,
  type ProductListing,
  type RegularFacetValue,
  type Search,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {parseDate} from '@/src/utils/date-utils';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {renderBreadcrumbButton} from '../../common/breadbox/breadcrumb-button';
import {renderBreadcrumbClearAll} from '../../common/breadbox/breadcrumb-clear-all';
import {renderBreadcrumbContainer} from '../../common/breadbox/breadcrumb-container';
import {renderBreadcrumbContent} from '../../common/breadbox/breadcrumb-content';
import {renderBreadcrumbShowLess} from '../../common/breadbox/breadcrumb-show-less';
import {renderBreadcrumbShowMore} from '../../common/breadbox/breadcrumb-show-more';
import type {Breadcrumb as BreadboxBreadcrumb} from '../../common/breadbox/breadcrumb-types';
import {formatHumanReadable} from '../../common/facets/numeric-facet/formatter';
import {
  defaultCurrencyFormatter,
  defaultNumberFormatter,
} from '../../common/formats/format-common';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-commerce-breadbox.tw.css';

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
 */
@customElement('atomic-commerce-breadbox')
@bindings()
@withTailwindStyles
export class AtomicCommerceBreadbox
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = styles;

  private resizeObserver?: ResizeObserver;
  private lastRemovedBreadcrumbIndex = 0;
  private numberOfBreadcrumbs = 0;
  private numberOfCollapsedBreadcrumbs = 0;
  private firstExpandedBreadcrumbIndex?: number;
  private breadcrumbRemovedFocus!: FocusTargetController;
  private breadcrumbShowMoreFocus!: FocusTargetController;
  private breadcrumbShowLessFocus!: FocusTargetController;

  public bindings!: CommerceBindings;
  public breadcrumbManager!: BreadcrumbManager;
  public context!: Context;
  @bindStateToController('context')
  @state()
  public contextState!: ContextState;
  private searchOrListing!: Search | ProductListing;

  @bindStateToController('breadcrumbManager')
  @state()
  public breadcrumbManagerState!: BreadcrumbManagerState;

  @state() public error!: Error;
  @state() private isCollapsed = true;
  @state() private showMoreText = '';

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
  @property({type: Number, attribute: 'path-limit'}) pathLimit = 3;

  public initialize() {
    this.validateProps();
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }
    this.context = buildContext(this.bindings.engine);
    this.breadcrumbManager = this.searchOrListing.breadcrumbManager();

    if (window.ResizeObserver && this.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.adaptBreadcrumbs());
      this.resizeObserver.observe(this.parentElement);
    }

    this.breadcrumbRemovedFocus = new FocusTargetController(
      this,
      this.bindings
    );
    this.breadcrumbShowMoreFocus = new FocusTargetController(
      this,
      this.bindings
    );
    this.breadcrumbShowLessFocus = new FocusTargetController(
      this,
      this.bindings
    );
  }

  willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('pathLimit')) {
      this.validateProps();
    }
  }

  firstUpdated() {
    this.adaptBreadcrumbs();
  }

  updateCompleted() {
    this.adaptBreadcrumbs();
  }

  private validateProps() {
    try {
      new Schema({
        pathLimit: new NumberValue({
          default: 3,
          min: 1,
          required: false,
        }),
      }).validate({
        pathLimit: this.pathLimit,
      });
    } catch (error) {
      this.error = error as Error;
      return;
    }
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  private get breadcrumbs() {
    return Array.from(
      this.shadowRoot!.querySelectorAll('li.breadcrumb')
    ) as HTMLElement[];
  }

  private get showMoreButton() {
    return this.shadowRoot!.querySelector(
      'button[part="show-more"]'
    ) as HTMLButtonElement;
  }

  private get showLessButton() {
    return this.shadowRoot!.querySelector(
      'button[part="show-less"]'
    ) as HTMLButtonElement;
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

  private adaptBreadcrumbs() {
    if (!this.breadcrumbs.length) {
      return;
    }
    this.showAllBreadcrumbs();

    if (!this.isCollapsed) {
      this.updateShowLessDisplay();
      return;
    }

    this.hideOverflowingBreadcrumbs();
  }

  private updateShowLessDisplay() {
    this.show(this.showLessButton);
    if (this.showLessButton.offsetTop === 0) {
      this.hide(this.showLessButton);
    }
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

  private get isOverflowing() {
    const listElement = this.shadowRoot!.querySelector('ul');
    if (!listElement) {
      return false;
    }
    return listElement.scrollWidth > listElement.clientWidth;
  }

  private updateShowMoreValue(value: number) {
    this.numberOfCollapsedBreadcrumbs = value;
    if (value === 0) {
      this.hide(this.showMoreButton);
      return;
    }
    this.show(this.showMoreButton);

    this.showMoreText = `+ ${value.toLocaleString(
      this.bindings.i18n.language
    )}`;
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
        label: breadcrumb.facetDisplayName ?? this.bindings.i18n.t('no-label'),
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

      return html`${renderBreadcrumbButton({
        props: {
          pathLimit: this.pathLimit,
          breadcrumb,
          i18n: this.bindings.i18n,
          onSelectBreadcrumb: () => {
            if (isLastBreadcrumb) {
              this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
            } else if (this.numberOfBreadcrumbs > 1) {
              this.breadcrumbRemovedFocus.focusAfterSearch();
            }

            this.lastRemovedBreadcrumbIndex = index;
            breadcrumb.deselect();
          },
          refCallback: async (ref) => {
            if (this.lastRemovedBreadcrumbIndex === index) {
              await this.breadcrumbRemovedFocus.setTarget(ref);
            }
            if (this.firstExpandedBreadcrumbIndex === index) {
              await this.breadcrumbShowMoreFocus.setTarget(ref);
            }
          },
        },
      })(
        html`${renderBreadcrumbContent({
          props: {
            pathLimit: this.pathLimit,
            isCollapsed: this.isCollapsed,
            i18n: this.bindings.i18n,
            breadcrumb,
          },
        })}`
      )}`;
    });
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const breadcrumbs = this.breadcrumbManagerState.facetBreadcrumbs.flatMap(
      (breadcrumb) => {
        return this.buildBreadcrumb(breadcrumb);
      }
    );

    if (!breadcrumbs.length) {
      return html`${nothing}`;
    }

    return html`${renderBreadcrumbContainer({
      props: {
        isCollapsed: this.isCollapsed,
        i18n: this.bindings.i18n,
      },
    })(
      html`${this.renderBreadcrumbs(breadcrumbs)}
      ${renderBreadcrumbShowMore({
        props: {
          refCallback: async (el) => {
            await this.breadcrumbShowLessFocus.setTarget(el!);
          },
          onShowMore: () => {
            this.firstExpandedBreadcrumbIndex =
              this.numberOfBreadcrumbs - this.numberOfCollapsedBreadcrumbs;
            this.breadcrumbShowMoreFocus.focusOnNextTarget();
            this.isCollapsed = false;
          },
          isCollapsed: this.isCollapsed,
          i18n: this.bindings.i18n,
          numberOfCollapsedBreadcrumbs: this.numberOfCollapsedBreadcrumbs,
          value: this.showMoreText,
          ariaLabel: this.bindings.i18n.t('show-n-more-filters', {
            value: this.showMoreText,
          }),
        },
      })}
      ${renderBreadcrumbShowLess({
        props: {
          onShowLess: () => {
            this.breadcrumbShowLessFocus.focusOnNextTarget();
            this.isCollapsed = true;
          },
          isCollapsed: this.isCollapsed,
          i18n: this.bindings.i18n,
        },
      })}
      ${renderBreadcrumbClearAll({
        props: {
          refCallback: async (ref) => {
            const isFocusTarget =
              this.lastRemovedBreadcrumbIndex === this.numberOfBreadcrumbs;

            if (isFocusTarget) {
              await this.breadcrumbRemovedFocus.setTarget(ref);
            }
          },
          onClick: () => {
            this.breadcrumbManager.deselectAll();
            this.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
          },
          isCollapsed: this.isCollapsed,
          i18n: this.bindings.i18n,
        },
      })} `
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-breadbox': AtomicCommerceBreadbox;
  }
}
