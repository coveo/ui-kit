import {Component, h, State, Prop} from '@stencil/core';
import {
  Facet,
  FacetState,
  FacetValue,
  Unsubscribe,
  FacetOptions,
} from '@coveo/headless';
import {headlessEngine} from '../../engine';

@Component({
  tag: 'atomic-facet',
  styleUrl: 'atomic-facet.css',
  shadow: true,
})
export class AtomicFacet {
  @Prop() field = '';
  @Prop() label = 'No label';
  @State() state!: FacetState;

  private facet: Facet;
  private unsubscribe: Unsubscribe;

  constructor() {
    const options: FacetOptions = {field: this.field};
    this.facet = new Facet(headlessEngine, {options});
    this.unsubscribe = this.facet.subscribe(() => this.updateState());
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

  private buildListItem(item: FacetValue) {
    const isSelected = this.facet.isValueSelected(item);

    return (
      <div onClick={() => this.facet.toggleSelect(item)}>
        <input type="checkbox" checked={isSelected}></input>
        <span>{item.value}</span>
        <span>{item.numberOfResults}</span>
      </div>
    );
  }

  private get resetButton() {
    return this.facet.hasActiveValues ? (
      <button onClick={() => this.facet.deselectAll()}>X</button>
    ) : null;
  }

  render() {
    return (
      <div>
        <div>
          <span>{this.label}</span>
          {this.resetButton}
        </div>
        <div>{this.values}</div>
      </div>
    );
  }
}
