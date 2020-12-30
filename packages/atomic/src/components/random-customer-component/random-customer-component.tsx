import {Engine, HeadlessEngine, searchAppReducers} from '@coveo/headless';
import {Component, h} from '@stencil/core';

@Component({
  tag: 'random-customer-component',
  shadow: true,
})
export class RandomCustomerComponent {
  engine: Engine;

  constructor() {
    this.engine = new HeadlessEngine({
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: searchAppReducers,
    });
  }
  render() {
    return [
      <atomic-search-box engine={this.engine}></atomic-search-box>,
      <atomic-result-list engine={this.engine}></atomic-result-list>,
    ];
  }
}
