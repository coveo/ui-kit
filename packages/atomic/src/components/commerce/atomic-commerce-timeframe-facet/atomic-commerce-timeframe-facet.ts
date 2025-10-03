import {
  type DateFacet,
  type DateFacetState,
  type DateFacetValue,
  type DateFilterRange,
  deserializeRelativeDate,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '@/src/components/common/facets/facet-value-link/facet-value-link';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {parseDate} from '@/src/utils/date-utils';
import '../../common/atomic-facet-date-input/atomic-facet-date-input';
import {bindings} from '@/src/decorators/bindings';
import type {FacetDateInputEventDetails} from '../../common/atomic-facet-date-input/atomic-facet-date-input';
import {shouldDisplayInputForFacetRange} from '../../common/facets/facet-common';
import facetCommonStyles from '../../common/facets/facet-common.tw.css';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * A facet is a list of values for a certain field occurring in the products.
 * An `atomic-commerce-timeframe-facet` displays a facet of the products for the current query as date intervals.
 *
 * @part facet - The wrapper for the entire facet.
 * @part label-button - The header button to expand/collapse the facet.
 * @part label-button-icon - The expand/collapse icon in the header.
 * @part clear-button - The button to clear all selected values.
 * @part clear-button-icon - The icon in the clear button.
 * @part values - The container for the facet values list.
 * @part value-link - A facet value button.
 * @part value-link-selected - A selected facet value button.
 * @part value-count - The product count for a facet value.
 * @part value-label - The label text of a facet value.
 * @part input-label - The label for date input fields.
 * @part input-start - The start date input field.
 * @part input-end - The end date input field.
 * @part input-apply-button - The button to apply date range selection.
 */
@customElement('atomic-commerce-timeframe-facet')
@bindings()
@withTailwindStyles
export class AtomicCommerceTimeframeFacet
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = facetCommonStyles;

  /**
   * The Summary controller instance.
   */
  @property({type: Object}) summary!: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  /**
   * The date facet controller instance.
   */
  @property({type: Object}) facet!: DateFacet;
  /**
   * Whether the facet is collapsed.
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: 'is-collapsed',
  })
  isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @property({reflect: true}) field?: string;

  @state() bindings!: CommerceBindings;
  @state() error!: Error;

  @bindStateToController('summary')
  @state()
  summaryState!: SearchSummaryState | ProductListingSummaryState;

  @bindStateToController('facet')
  @state()
  facetState!: DateFacetState;

  @state() private inputRange?: DateFilterRange;

  private headerFocus?: FocusTargetController;

  private get displayName() {
    return this.facetState.displayName || 'no-label';
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
  }

  public initialize() {
    this.validateFacet();
  }

  private applyDateInput(event: CustomEvent<DateFilterRange>) {
    this.inputRange = {start: event.detail.start, end: event.detail.end};
  }

  private get valuesToRender() {
    return (
      this.facetState.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
  }

  private get shouldRenderValues() {
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get shouldRenderInput() {
    const {
      firstRequestExecuted: firstSearchExecuted,
      hasError,
      isLoading,
      hasProducts: hasResults,
    } = this.summaryState;
    return shouldDisplayInputForFacetRange({
      hasInputRange: this.hasInputRange,
      searchStatusState: {
        firstSearchExecuted,
        hasError,
        hasResults,
        isLoading,
      },
      facetValues: this.facetState.values || [],
      hasInput: true,
    });
  }

  private get numberOfSelectedValues() {
    if (this.hasInputRange) {
      return 1;
    }

    return (
      this.facetState.values.filter(({state}) => state === 'selected').length ||
      0
    );
  }

  private get hasInputRange() {
    return !!this.inputRange;
  }

  private resetRange() {
    this.inputRange = undefined;
    this.facet.setRanges([]);
  }

  private formatFacetValue(facetValue: DateFacetValue) {
    try {
      const startDate = deserializeRelativeDate(facetValue.start);
      const relativeDate =
        startDate.period === 'past'
          ? startDate
          : deserializeRelativeDate(facetValue.end);

      return this.bindings.i18n.t(
        `${relativeDate.period}-${relativeDate.unit}`,
        {
          count: relativeDate.amount,
        }
      );
    } catch (_error) {
      return this.bindings.i18n.t('to', {
        start: parseDate(facetValue.start).format('YYYY-MM-DD'),
        end: parseDate(facetValue.end).format('YYYY-MM-DD'),
      });
    }
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.valuesToRender.map((value) => this.renderValue(value))
    );
  }

  private renderValue(facetValue: DateFacetValue) {
    const displayValue = this.formatFacetValue(facetValue);
    const isSelected = facetValue.state === 'selected';
    const isExcluded = facetValue.state === 'excluded';
    return renderFacetValueLink({
      props: {
        displayValue,
        isSelected,
        numberOfResults: facetValue.numberOfResults,
        i18n: this.bindings.i18n,
        onClick: () => this.facet.toggleSingleSelect(facetValue),
      },
    })(
      renderFacetValueLabelHighlight({
        props: {
          displayValue,
          isSelected,
          isExcluded,
        },
      })
    );
  }

  private renderValuesContainer(children: unknown[]) {
    return renderFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.displayName,
      },
    })(
      html`<ul class="mt-3" part="values">
        ${children}
      </ul>`
    );
  }

  private renderHeader() {
    return renderFacetHeader({
      props: {
        i18n: this.bindings.i18n,
        label: this.displayName,
        onClearFilters: () => {
          this.focusTarget.focusAfterSearch();
          if (this.hasInputRange) {
            this.resetRange();
            return;
          }
          this.facet.deselectAll();
        },
        numberOfActiveValues: this.numberOfSelectedValues,
        isCollapsed: this.isCollapsed,
        headingLevel: 0,
        onToggleCollapse: () => {
          this.isCollapsed = !this.isCollapsed;
        },
        headerRef: (el) => this.focusTarget.setTarget(el),
      },
    });
  }

  private renderDateInput() {
    return html`
      <atomic-facet-date-input
        .label=${this.displayName}
        .inputRange=${this.inputRange}
        .facetId=${this.facetState.facetId}
        @atomic-date-input-apply=${(
          event: CustomEvent<FacetDateInputEventDetails>
        ) => {
          const {start, end, endInclusive} = event.detail;
          this.facet.setRanges([
            {
              start,
              end,
              endInclusive,
              state: 'selected',
            },
          ]);
          this.applyDateInput(event);
        }}
      ></atomic-facet-date-input>
    `;
  }

  @bindingGuard()
  @errorGuard()
  protected render() {
    const {hasError, firstRequestExecuted} = this.summaryState;

    return html`${when(
      !hasError && firstRequestExecuted && this.shouldRenderFacet,
      () =>
        renderFacetContainer()(
          html`${this.renderHeader()}
          ${when(
            !this.isCollapsed,
            () => html`
              ${when(this.shouldRenderValues, () => this.renderValues())}
              ${when(this.shouldRenderInput, () => this.renderDateInput())}
            `
          )}`
        )
    )}`;
  }

  public updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (changedProps.has('facet')) {
      this.validateFacet();
    }
  }

  private validateFacet() {
    if (!this.facet) {
      this.error = new Error(
        'The "facet" property is required for <atomic-commerce-timeframe-facet>.'
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-timeframe-facet': AtomicCommerceTimeframeFacet;
  }
}
