// biome-ignore lint/correctness/noUnusedImports: <>
import {Component, h} from '@stencil/core';

@Component({
  tag: 'results-manager',
  shadow: false,
})
export class ResultsManager {
  public render() {
    return <atomic-result-list></atomic-result-list>;
  }
}
