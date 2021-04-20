import {Component, Element, h, Prop, State} from '@stencil/core';
import {
  NumericFacet,
  buildNumericFacet,
  buildNumericRange,
  NumericFacetState,
  NumericFacetOptions,
  NumericFacetValue,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  I18nState,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FacetValue} from '../facet-value/facet-value';
import {
  BaseFacet,
  BaseFacetController,
  BaseFacetState,
} from '../base-facet/base-facet';

/**
 * The `atomic-numeric-facet` component displays values as numeric ranges. In mobile browsers, this is rendered as a button which opens a facet modal.
 *
 *
 * @part facet - The wrapper for the entire facet
 * @part close-button - The button to close the facet when displayed modally (mobile only)
 * @part clear-button - The button that resets the actively selected facet values
 *
 * @part placeholder - The placeholder shown before the first search is executed.
 * @part value - A single facet value
 * @part value-label - The facet value label
 * @part value-count - The facet value count
 *
 */
@Component({
  tag: 'atomic-numeric-facet',
  styleUrl: 'atomic-numeric-facet.pcss',
  shadow: true,
})
export class AtomicNumericFacet
  implements InitializableComponent, BaseFacetState {
  @Element() host!: HTMLElement;
  @InitializeBindings() public bindings!: Bindings;
  private facet!: NumericFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: NumericFacetState;
  @State() public error!: Error;

  @BindStateToI18n()
  @State()
  public strings: I18nState = {
    clear: () => this.bindings.i18n.t('clear'),
    facetValue: (variables) => this.bindings.i18n.t('facetValue', variables),
    to: (variables) => this.bindings.i18n.t('to', variables),
  };

  @State() public isExpanded = false;
  @Prop({mutable: true, reflect: true}) public facetId = '';
  /**
   * Specifies the index field whose values the facet should use.
   */
  @Prop() public field = '';
  /**
   * The non-localized label for the facet.
   */
  @Prop() public label = 'No label';

  private buildManualRanges() {
    const options = Array.from(
      this.host.querySelectorAll('atomic-numeric-range')
    );
    return options.map(({start, end, endInclusive}) =>
      buildNumericRange({start, end, endInclusive})
    );
  }

  public initialize() {
    const manualRanges = this.buildManualRanges();
    const options: NumericFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: manualRanges.length === 0,
      currentValues: manualRanges,
    };

    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.strings[this.label] = () => this.bindings.i18n.t(this.label);
    this.facetId = this.facet.state.facetId;
    this.bindings.store.state.facets[this.facetId] = {
      label: this.label,
    };
  }

  private get values() {
    return this.facetState.values.map((listItem) => {
      if (!listItem.numberOfResults && !this.facet.isValueSelected(listItem)) {
        return null;
      }
      return this.buildListItem(listItem);
    });
  }

  private buildListItem(item: NumericFacetValue) {
    const isSelected = this.facet.isValueSelected(item);
    const {language} = this.bindings.i18n;
    const start = item.start.toLocaleString(language);
    const end = item.end.toLocaleString(language);
    const value = this.strings.to({start, end});

    return (
      <FacetValue
        label={value}
        isSelected={isSelected}
        numberOfResults={item.numberOfResults}
        facetValueSelected={() => {
          this.facet.toggleSelect(item);
        }}
        ariaLabel={this.strings.facetValue({
          value,
          numberOfResults: item.numberOfResults,
        })}
      />
    );
  }

  public get totalNumberOfResults() {
    return this.facetState.values.reduce(
      (accum, value) => accum + value.numberOfResults,
      0
    );
  }

  public render() {
    if (!this.facetState.hasActiveValues && this.totalNumberOfResults === 0) {
      return null;
    }
    return (
      <BaseFacet
        controller={new BaseFacetController(this)}
        label={this.strings[this.label]()}
        hasActiveValues={this.facetState.hasActiveValues}
        deselectAll={() => this.facet.deselectAll()}
      >
        <ul part="facet-values" class="list-none p-0">
          {this.values}
        </ul>
      </BaseFacet>
    );
  }
}
