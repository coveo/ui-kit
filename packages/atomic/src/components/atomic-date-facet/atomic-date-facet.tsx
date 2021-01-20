import {Component, Prop, State, h} from '@stencil/core';
import {
  DateFacet,
  buildDateFacet,
  DateFacetState,
  DateFacetOptions,
  DateFacetValue,
  RangeFacetSortCriterion,
  Unsubscribe,
} from '@coveo/headless';
import {
  Initialization,
  InterfaceContext,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-date-facet',
  styleUrl: 'atomic-date-facet.pcss',
  shadow: true,
})
export class AtomicDateFacet {
  @Prop({mutable: true}) facetId = '';
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() state!: DateFacetState;
  private context!: InterfaceContext;

  private facet!: DateFacet;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: true,
    };

    this.facet = buildDateFacet(this.context.engine, {options});
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

  private buildListItem(item: DateFacetValue) {
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
