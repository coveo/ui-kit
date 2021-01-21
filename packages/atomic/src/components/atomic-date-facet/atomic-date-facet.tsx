import {Component, Prop, State, h} from '@stencil/core';
import {
  DateFacet,
  buildDateFacet,
  DateFacetState,
  DateFacetOptions,
  DateFacetValue,
  RangeFacetSortCriterion,
} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-date-facet',
  styleUrl: 'atomic-date-facet.css',
  shadow: true,
})
export class AtomicDateFacet implements AtomicComponentInterface {
  @Prop({mutable: true}) facetId = '';
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() controllerState!: DateFacetState;

  public bindings!: Bindings;
  public controller!: DateFacet;

  @Initialization({resubscribeControllerOnConnectedCallback: true})
  public initialize() {
    const options: DateFacetOptions = {
      facetId: this.facetId,
      field: this.field,
      generateAutomaticRanges: true,
    };

    this.controller = buildDateFacet(this.bindings.engine, {options});
    this.facetId = this.controller.state.facetId;
  }

  private get values() {
    return this.controllerState.values.map((listItem) =>
      this.buildListItem(listItem)
    );
  }

  private buildListItem(item: DateFacetValue) {
    const isSelected = this.controller.isValueSelected(item);

    return (
      <div onClick={() => this.controller.toggleSelect(item)}>
        <input type="checkbox" checked={isSelected}></input>
        <span>
          {item.start}-{item.end} {item.numberOfResults}
        </span>
      </div>
    );
  }

  private get resetButton() {
    return this.controllerState.hasActiveValues ? (
      <button onClick={() => this.controller.deselectAll()}>X</button>
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
      <option
        value={criterion}
        selected={this.controller.isSortedBy(criterion)}
      >
        {criterion}
      </option>
    ));
  }

  private onFacetSortChange(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const criterion = select.value as RangeFacetSortCriterion;

    this.controller.sortBy(criterion);
  }

  // TODO: improve loading style
  public renderLoading() {
    return (
      <div class="loading">
        {Array.from(Array(10)).map(() => (
          <p></p>
        ))}
      </div>
    );
  }

  render() {
    if (this.controllerState.isLoading) {
      return this.renderLoading();
    }

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
