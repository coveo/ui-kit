import {
  getSampleSearchEngineConfiguration,
  SearchEngineConfiguration,
} from '@coveo/headless';
import { html } from 'lit-html';
import {debounce} from 'lodash';

interface SearchInterface extends HTMLElement {
  initialize: (cfg: SearchEngineConfiguration) => Promise<void>;
  executeFirstSearch: () => Promise<void>;
}

export const initializeInterfaceDebounced = (
  renderComponentFunction: () => string,
  engineConfig: Partial<SearchEngineConfiguration> = {}
) => html`
      <atomic-search-interface>
        ${renderComponentFunction()}
        <div style="margin:20px 0">
          Select facet value(s) to see the Breadbox component.
        </div>
        <div style="display: flex; justify-content: flex-start;">
          <atomic-facet
            field="objecttype"
            style="flex-grow:1"
            label="Object type"
          ></atomic-facet>
          <atomic-facet
            field="filetype"
            style="flex-grow:1"
            label="File type"
          ></atomic-facet>
          <atomic-facet
            field="source"
            style="flex-grow:1"
            label="Source"
          ></atomic-facet>
        </div>
      </atomic-search-interface>
    `
