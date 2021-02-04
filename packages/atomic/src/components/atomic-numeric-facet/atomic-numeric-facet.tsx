import {Component, h, Prop, State} from '@stencil/core';
import {
  NumericFacet,
  buildNumericFacet,
  buildNumericRange,
  NumericFacetState,
  NumericFacetOptions,
  NumericFacetValue,
  RangeFacetSortCriterion,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

import {randomID} from '../../utils/utils';
import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';

@Component({
  tag: 'atomic-numeric-facet',
  styleUrl: 'atomic-numeric-facet.pcss',
  shadow: true,
})
export class AtomicNumericFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private facet!: NumericFacet;

  @BindStateToController('facet', {subscribeOnConnectedCallback: true})
  @State()
  private facetState!: NumericFacetState;
  @State() public error!: Error;
  @State() public isExpanded: Boolean = false;
  @Prop({mutable: true}) public facetId = '';
  @Prop() public field = '';
  @Prop() public label = 'No label';

  public initialize() {
    const options: NumericFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: false,
      currentValues: [
        buildNumericRange({start: 0, end: 20}),
        buildNumericRange({start: 20, end: 40}),
        buildNumericRange({start: 40, end: 60}),
        buildNumericRange({start: 60, end: 80}),
        buildNumericRange({start: 80, end: 100}),
      ],
    };

    this.facet = buildNumericFacet(this.bindings.engine, {options});
    this.facetId = this.facet.state.facetId;
  }

  private get values() {
    return this.facetState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: NumericFacetValue) {
    const isSelected = this.facet.isValueSelected(item);
    const id = randomID('');
    return (
      <li role="option" class="value">
        <input
          type="checkbox"
          checked={isSelected}
          class="checkbox"
          id={`${id}-input`}
          name={`${id}-input`}
          onClick={() => {
            this.facet.toggleSelect(item);
          }}
        />
        <label htmlFor={`${id}-input`} class="label">
          {item.start}-{item.end}{' '}
          <span class="number-of-results">({item.numberOfResults})</span>
        </label>
      </li>
    );
  }

  private get resetButton() {
    return this.facetState.hasActiveValues ? (
      <button
        onClick={() => this.facet.deselectAll()}
        class="block text-primary mr-2 text-sm"
      >
        Clear
      </button>
    ) : null;
  }

  private get sortSelector() {
    return (
      <select
        class="sort"
        name="facetSort"
        onChange={(val) => this.onFacetSortChange(val)}
      >
        {this.sortOptions}
      </select>
    );
  }

  private get closeButton() {
    return this.isExpanded ? (
      <button
        onClick={() => {
          this.isExpanded = false;
          document.body.classList.remove('overflow-hidden');
        }}
        class="close-button ml-2"
      >
        <div innerHTML={CloseIcon} />
      </button>
    ) : null;
  }

  private get sortOptions() {
    const criteria: RangeFacetSortCriterion[] = ['ascending', 'descending'];

    return criteria.map((criterion) => (
      <option value={criterion} selected={this.facet.isSortedBy(criterion)}>
        {criterion}
      </option>
    ));
  }

  private onFacetSortChange(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const criterion = select.value as RangeFacetSortCriterion;

    this.facet.sortBy(criterion);
  }

  public render() {
    return (
      <div class="facet">
        <button
          class="open-button"
          onClick={() => {
            this.isExpanded = true;
            document.body.classList.add('overflow-hidden');
          }}
        >
          {this.label}
        </button>
        <div class={'content ' + (this.isExpanded ? 'active' : '')}>
          <div class="header">
            <span class="label">{this.label}</span>
            <span class="buttons">
              {this.resetButton}
              {this.sortSelector}
              {this.closeButton}
            </span>
          </div>
          <ul class="list-none">{this.values}</ul>
        </div>
      </div>
    );
  }
}
