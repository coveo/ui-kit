import {renderNumericFacetValuesGroup} from '@/src/components/common/facets/numeric-facet/values-container';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {
  NumericFacet,
  NumericFacetState,
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
  Context,
  ContextState,
  buildContext,
} from '@coveo/headless/commerce';
import {CSSResultGroup, LitElement, html, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {shouldDisplayInputForFacetRange} from '../../common/facets/facet-common';
import {FacetInfo} from '../../common/facets/facet-common-store';
import {renderFacetContainer} from '../../common/facets/facet-container/facet-container';
import {renderFacetHeader} from '../../common/facets/facet-header/facet-header';
import {renderNumericFacetValue} from '../../common/facets/numeric-facet/value-link';
import {initializePopover} from '../../common/facets/popover/popover-type';
import {
  defaultCurrencyFormatter,
  defaultNumberFormatter,
} from '../../common/formats/format-common';
import type {Range} from '../atomic-commerce-facet-number-input/atomic-commerce-facet-number-input';
// TODO: remove
import '../atomic-commerce-facet-number-input/atomic-commerce-facet-number-input';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-commerce-numeric-facet.tw.css';

/**
 * The `atomic-commerce-numeric-facet` component is responsible for rendering a commerce facet that allows the user to filter products using numeric ranges.
 *
 * @part facet - The wrapper around the entire facet.
 * @part label-button - The clickable label button that toggles facet visibility.
 * @part label-button-icon - The icon displayed in the label button (expand/collapse arrow).
 * @part clear-button - The button to clear all selected facet values.
 * @part clear-button-icon - The icon displayed in the clear button.
 * @part values - The list container for all facet values.
 * @part value-label - The text label for individual facet values.
 * @part value-count - The count indicator showing number of results for each value.
 * @part value-checkbox-label - The label associated with facet value checkboxes.
 * @part value-exclude-button - The button to exclude specific facet values.
 * @part input-form - The form container for numeric range inputs.
 * @part label-start - The label for the minimum value input field.
 * @part input-start - The input field for entering minimum numeric value.
 * @part label-end - The label for the maximum value input field.
 * @part input-end - The input field for entering maximum numeric value.
 * @part input-apply-button - The button to apply custom numeric range values.
 *
 * @alpha
 */
@customElement('atomic-commerce-numeric-facet')
@withTailwindStyles
export class AtomicCommerceNumericFacet
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  /**
   * The Summary controller instance.
   */
  @property({type: Object}) summary!: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  /**
   * The facet controller instance.
   */
  @property({type: Object}) facet!: NumericFacet;
  /**
   * Specifies whether the facet is collapsed.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'is-collapsed',
    converter: booleanConverter,
  })
  isCollapsed = false;
  /**
   * The field identifier for this facet.
   */
  @property({reflect: true})
  field?: string;

  public context!: Context;

  @state() bindings!: CommerceBindings;

  @bindStateToController('facet')
  @state()
  public facetState!: NumericFacetState;

  @bindStateToController('summary')
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @bindStateToController('context')
  @state()
  public contextState!: ContextState;

  @state() public error!: Error;

  private headerFocus!: FocusTargetController;
  private unsubscribeFacetController?: () => void | undefined;

  static styles: CSSResultGroup = [unsafeCSS(styles)];

  public initialize() {
    this.validateFacet();
    this.context = buildContext(this.bindings.engine);
    this.ensureSubscribed();
    this.registerFacetToStore();
  }

  public disconnectedCallback(): void {
    this.unsubscribeFacetController?.();
    this.unsubscribeFacetController = undefined;
    super.disconnectedCallback();
  }

  public updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (changedProps.has('facet')) {
      this.validateFacet();
    }
  }

  private get formatter() {
    if (this.field === 'ec_price' || this.field === 'ec_promo_price') {
      return defaultCurrencyFormatter(this.contextState.currency);
    }
    return defaultNumberFormatter;
  }

  private registerFacetToStore() {
    const {facetId} = this.facetState;
    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.displayName),
      facetId: facetId,
      element: this,
      isHidden: () => this.isHidden,
    };
    initializePopover(this, {
      ...facetInfo,
      hasValues: () => this.hasValues,
      numberOfActiveValues: () => this.numberOfSelectedValues,
    });
  }

  private get focusTarget(): FocusTargetController {
    if (!this.headerFocus) {
      this.headerFocus = new FocusTargetController(this, this.bindings);
    }
    return this.headerFocus;
  }

  private get displayName() {
    return this.facetState.displayName || 'no-label';
  }

  private get numberOfSelectedValues() {
    return (
      this.facetState.values.filter(({state}) => state === 'selected').length ||
      0
    );
  }

  private get hasInputRange() {
    return !!this.facetState.manualRange || this.summaryState.isLoading;
  }

  private get shouldRenderValues() {
    return !this.hasInputRange && !!this.valuesToRender.length;
  }

  private get valuesToRender() {
    return (
      this.facetState.values.filter(
        (value) => value.numberOfResults || value.state !== 'idle'
      ) || []
    );
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
      facetValues: this.facetState.values,
      hasInput: true,
    });
  }

  private get isHidden() {
    return !this.shouldRenderFacet;
  }

  private get shouldRenderFacet() {
    return this.shouldRenderInput || this.shouldRenderValues;
  }

  private get hasValues() {
    if (this.facetState.values.length) {
      return true;
    }
    return !!this.valuesToRender.length;
  }

  private ensureSubscribed() {
    if (this.unsubscribeFacetController) {
      return;
    }
    this.unsubscribeFacetController = this.facet?.subscribe(
      () => (this.facetState = this.facet.state)
    );
  }

  private renderValues() {
    return renderNumericFacetValuesGroup({
      props: {
        i18n: this.bindings.i18n,
        label: this.displayName,
      },
    })(
      html`<ul part="values" class="mt-3">
        ${this.valuesToRender.map((value) =>
          renderNumericFacetValue({
            props: {
              formatter: this.formatter,
              displayValuesAs: 'checkbox',
              facetValue: value,
              field: this.facetState.field,
              i18n: this.bindings.i18n,
              logger: this.bindings.engine.logger,
              manualRanges: [],
              onClick: () => this.facet.toggleSelect(value),
            },
          })
        )}
      </ul>`
    );
  }

  private onNumberInputApply(event: CustomEvent<Range>) {
    const {
      detail: {start, end},
    } = event;

    this.facet.setRanges([
      {
        start,
        end,
        endInclusive: true,
        state: 'selected',
      },
    ]);
  }

  @bindingGuard()
  @errorGuard()
  protected render() {
    const {firstRequestExecuted} = this.summaryState;
    return html` ${when(!firstRequestExecuted || this.shouldRenderFacet, () =>
      renderFacetContainer()(
        html` ${renderFacetHeader({
          props: {
            i18n: this.bindings.i18n,
            label: this.displayName,
            numberOfActiveValues: this.numberOfSelectedValues,
            isCollapsed: this.isCollapsed,
            headingLevel: 0,
            onToggleCollapse: () => (this.isCollapsed = !this.isCollapsed),
            onClearFilters: () => {
              this.focusTarget.focusAfterSearch();
              this.facet.deselectAll();
            },
            headerRef: (el) => this.focusTarget.setTarget(el),
          },
        })}
        ${when(
          !this.isCollapsed,
          () =>
            html`${when(this.shouldRenderValues, () => this.renderValues())}
            ${when(
              this.shouldRenderInput,
              () =>
                html`<atomic-commerce-facet-number-input
                  label=${this.displayName}
                  .facet=${this.facet}
                  .range=${this.facetState.manualRange}
                  @atomic-number-input-apply=${this.onNumberInputApply}
                ></atomic-commerce-facet-number-input>`
            )}`
        )}`
      )
    )}`;
  }

  private validateFacet() {
    if (!this.facet) {
      this.error = new Error(
        'The "facet" property is required for <atomic-commerce-facet>.'
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-numeric-facet': AtomicCommerceNumericFacet;
  }
}
