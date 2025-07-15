import {renderFacetContainer} from '@/src/components/common/facets/facet-container/facet-container';
import {renderFacetHeader} from '@/src/components/common/facets/facet-header/facet-header';
import {renderFacetValueLabelHighlight} from '@/src/components/common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '@/src/components/common/facets/facet-value-link/facet-value-link';
import {renderFacetValuesGroup} from '@/src/components/common/facets/facet-values-group/facet-values-group';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {parseDate} from '@/src/utils/date-utils';
import {
  type DateFacet,
  type DateFilterRange,
  deserializeRelativeDate,
  type DateFacetValue,
  type DateFacetState,
  type DateRangeRequest,
  type SearchSummaryState,
  type ProductListingSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {shouldDisplayInputForFacetRange} from '../../common/facets/facet-common';
import type {FacetInfo} from '../../common/facets/facet-common-store';
import '../../common/facets/facet-date-input/atomic-facet-date-input/atomic-facet-date-input';
import {initializePopover} from '../../common/facets/popover/popover-type';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-commerce-timeframe-facet.tw.css';

/**
 * A facet is a list of values for a certain field occurring in the results.
 * An `atomic-commerce-timeframe-facet` displays a facet of the results for the current query as date intervals.
 *
 * @part facet - The wrapper for the entire facet.
 * @part label-button - The header button to expand/collapse the facet.
 * @part label-button-icon - The expand/collapse icon in the header.
 * @part clear-button - The button to clear all selected values.
 * @part clear-button-icon - The icon in the clear button.
 * @part values - The container for the facet values list.
 * @part value-link - A facet value button.
 * @part value-link-selected - A selected facet value button.
 * @part value-count - The result count for a facet value.
 * @part value-label - The label text of a facet value.
 * @part input-label - The label for date input fields.
 * @part input-start - The start date input field.
 * @part input-end - The end date input field.
 * @part input-apply-button - The button to apply date range selection.
 *
 * @internal
 */
@customElement('atomic-commerce-timeframe-facet')
@withTailwindStyles
@bindings()
export class AtomicCommerceTimeframeFacet
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  /**
   * The Summary controller instance.
   */
  @property({type: Object}) summary!: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  /**
   * The date facet controller instance.
   */
  @property({type: Object}) public facet!: DateFacet;
  /**
   * Specifies whether the facet is collapsed.
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: 'is-collapsed',
  })
  public isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @property({reflect: true}) field?: string;

  @state() bindings!: CommerceBindings;
  @state() public error!: Error;

  @bindStateToController('summary')
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @bindStateToController('facet')
  @state()
  public facetState!: DateFacetState;

  @state() private inputRange?: DateFilterRange;

  private headerFocus?: FocusTargetController;

  // TODO: check if this is needed
  private unsubscribeFacetController?: () => void;

  private get displayName() {
    return this.facetState.displayName || 'no-label';
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.validateFacet();
  }

  public initialize() {
    this.validateFacet();
    this.ensureSubscribed();
    this.registerFacetToStore();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!this.isConnected) {
      // TODO: check if still needed
      this.unsubscribeFacetController?.();
      this.unsubscribeFacetController = undefined;
    }
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

  private get hasValues() {
    if (this.facetState.values.length) {
      return true;
    }

    return !!this.valuesToRender.length;
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

  private registerFacetToStore() {
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: this.facetState.facetId,
      element: this,
      isHidden: () => !this.shouldRenderFacet,
    };

    // TODO: remove KIT-4549
    initializePopover(this, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });
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
        .bindings=${this.bindings}
        .label=${this.displayName}
        .rangeGetter=${() => this.inputRange}
        .facetId=${this.facetState.facetId}
        .rangeSetter=${({start, end, endInclusive}: DateRangeRequest) => {
          this.facet.setRanges([
            {
              start,
              end,
              endInclusive,
              state: 'selected',
            },
          ]);
        }}
        @atomic-date-input-apply=${this.applyDateInput}
      ></atomic-facet-date-input>
    `;
  }

  private ensureSubscribed() {
    // TODO: check if this is needed...
    if (this.unsubscribeFacetController) {
      return;
    }
    this.unsubscribeFacetController = this.facet?.subscribe(() => {
      this.facetState = this.facet.state;
    });
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
