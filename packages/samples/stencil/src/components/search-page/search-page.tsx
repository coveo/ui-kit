import {getSampleSearchEngineConfiguration} from '@coveo/atomic/headless';
import {Component, h} from '@stencil/core';
import {Header} from '../header/header';

@Component({
  tag: 'search-page',
  shadow: false,
})
export class SearchPage {
  async componentDidLoad() {
    const searchInterface: HTMLAtomicSearchInterfaceElement =
      document.querySelector('atomic-search-interface#searchpage')!;

    await searchInterface.initialize(getSampleSearchEngineConfiguration());

    searchInterface.executeFirstSearch();
  }

  render() {
    return (
      <atomic-search-interface id="searchpage">
        <Header>
          <atomic-search-box></atomic-search-box>
        </Header>
        <atomic-search-layout>
          <atomic-layout-section section="facets">
            <atomic-facet-manager>
              <atomic-facet
                field="source"
                label="Source"
                display-values-as="checkbox"
              ></atomic-facet>
              <atomic-facet
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
              <results-manager></results-manager>
              <atomic-query-error></atomic-query-error>
              <atomic-no-results></atomic-no-results>
            </atomic-layout-section>

            <atomic-layout-section section="pagination">
              <sample-component></sample-component>
            </atomic-layout-section>
          </atomic-layout-section>
        </atomic-search-layout>
      </atomic-search-interface>
    );
  }
}
