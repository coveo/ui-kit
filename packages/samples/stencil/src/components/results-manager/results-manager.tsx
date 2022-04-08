import {Component, h} from '@stencil/core';
import template from './template.html';

@Component({
  tag: 'results-manager',
  shadow: false,
})
export class ResultsManager {
  public render() {
    return (
      <atomic-result-list
        fields-to-include="source,filetype,date,source,author,sourcetype,language,filetype"
        display="list"
        density="comfortable"
      >
        <atomic-result-template>
          <template innerHTML={template}></template>
        </atomic-result-template>
      </atomic-result-list>
    );
  }
}
