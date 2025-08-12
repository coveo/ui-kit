import {
  loadSearchActions,
  loadSearchAnalyticsActions,
  type SearchEngine,
} from '@coveo/headless';
// biome-ignore lint/correctness/noUnusedImports: <>
import {Component, h, Prop} from '@stencil/core';
import template from './template.html';

@Component({
  tag: 'search-page',
  shadow: false,
})
export class SearchPage {
  @Prop() public engine?: SearchEngine;

  public componentDidLoad() {
    if (this.engine) {
      const action = loadSearchActions(this.engine).executeSearch(
        loadSearchAnalyticsActions(this.engine).logInterfaceLoad()
      );
      this.engine.dispatch(action);
    }
  }

  public render() {
    return (
      <atomic-search-layout>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-facet
              facet-id="source"
              field="source"
              label="Source"
              display-values-as="checkbox"
            ></atomic-facet>
            <atomic-facet
              facet-id="filetype"
              field="filetype"
              label="Filetype"
              display-values-as="checkbox"
            ></atomic-facet>{' '}
          </atomic-facet-manager>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-breadbox></atomic-breadbox>
            <atomic-query-summary></atomic-query-summary>
            <atomic-refine-toggle></atomic-refine-toggle>
            <atomic-sort-dropdown>
              <atomic-sort-expression
                label="Relevance"
                expression="relevancy"
              ></atomic-sort-expression>
              <atomic-sort-expression
                label="Most recent"
                expression="date descending"
              ></atomic-sort-expression>
            </atomic-sort-dropdown>
            <atomic-did-you-mean></atomic-did-you-mean>
          </atomic-layout-section>

          <atomic-layout-section section="results">
            <atomic-result-list>
              <atomic-result-template>
                <template innerHTML={template}></template>
              </atomic-result-template>
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>

          <atomic-layout-section section="pagination">
            <sample-component></sample-component>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    );
  }
}
