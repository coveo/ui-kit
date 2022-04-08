import {Component, h} from '@stencil/core';
import template from './template.html';

@Component({
  tag: 'results-manager',
  shadow: false,
})
export class ResultsManager {
  public render() {
    return (
      <atomic-result-list>
        <atomic-result-template>
          <template innerHTML={template}></template>
        </atomic-result-template>
      </atomic-result-list>
    );
  }
}
