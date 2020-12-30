import {Component, h, Prop, State} from '@stencil/core';
import {
  NumericFacet,
  buildNumericFacet,
  buildNumericRange,
  NumericFacetState,
  NumericFacetOptions,
  NumericFacetValue,
  RangeFacetSortCriterion,
  Unsubscribe,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-numeric-facet',
  styleUrl: 'atomic-numeric-facet.css',
  shadow: true,
})
export class AtomicNumericFacet {
  @Prop({mutable: true}) engine!: Engine;
  @Prop({mutable: true}) facetId = '';
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() state!: NumericFacetState;

  private unsubscribe: Unsubscribe = () => {};
  private facet!: NumericFacet;

  @Initialization()
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

    this.facet = buildNumericFacet(this.engine, {options});
    this.facetId = this.facet.state.facetId;
    this.subscribe();
  }

  private subscribe() {
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
  }

  public connectedCallback() {
    this.facet && this.subscribe();
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.facet.state;
  }

  private get values() {
    return this.state.values.map((listItem) => this.buildListItem(listItem));
  }

  private buildListItem(item: NumericFacetValue) {
    const isSelected = this.facet.isValueSelected(item);

    return (
      <div onClick={() => this.facet.toggleSelect(item)}>
        <input type="checkbox" checked={isSelected}></input>
        <span>
          {item.start}-{item.end} {item.numberOfResults}
        </span>
      </div>
    );
  }

  private get resetButton() {
    return this.state.hasActiveValues ? (
      <button onClick={() => this.facet.deselectAll()}>X</button>
    ) : null;
  }

  private get sortSelector() {
    return (
      <select name="facetSort" onChange={(val) => this.onFacetSortChange(val)}>
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

  render() {
    return (
      <div>
        <div>
          <span>{this.label}</span>
          {this.sortSelector}
          {this.resetButton}
        </div>
        <div>{this.values}</div>
      </div>
    );
  }
}
