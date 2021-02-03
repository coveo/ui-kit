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
      <li
        role="option"
        class="flex flex-row items-center mt-2 cursor-pointer"
        onClick={() => this.facet.toggleSelect(item)}
      >
        <span>
          <input
            type="checkbox"
            checked={isSelected}
            class="w-4 h-4"
            id={`${id}-input`}
            name={`${id}-input`}
          />
        </span>

        <label
          htmlFor={`${id}-input`}
          class="ml-3 flex flex-row text-on-background flex-grow cursor-pointer"
        >
          {item.start}-{item.end}{' '}
          <span class="ml-auto self-end text-secondary">
            ({item.numberOfResults})
          </span>
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
        class="p-1 apply-border-on-background rounded"
        name="facetSort"
        onChange={(val) => this.onFacetSortChange(val)}
      >
        {this.sortOptions}
      </select>
    );
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
      <div class="facet mx-2 my-4">
        <div class="flex flex-row items-center pb-2 mb-2 border-b border-solid border-on-background">
          <span class="font-semibold text-primary">{this.label}</span>
          <span class="flex flex-row block ml-auto">
            {this.resetButton}
            {this.sortSelector}
          </span>
        </div>
        <ul class="list-none">{this.values}</ul>
      </div>
    );
  }
}
