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
  @Prop() title = 'No title';
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

  private buildListItem(data: FacetValue) {
    return (
      <div>
        <input type="checkbox"></input>
        <span>{data.value}</span>
        <span>{data.numberOfResults}</span>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div>{this.title}</div>
        <div>{this.values}</div>
      </div>
    );
  }
}
