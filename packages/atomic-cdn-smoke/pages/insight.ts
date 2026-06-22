import {pageHtml} from '../fixtures.js';

export const insightPage = pageHtml(`
  <style>
    atomic-insight-interface {
      width: 500px;
      min-height: 800px;
      margin: 0 auto;
      display: block;
      box-shadow: 0px 3px 24px 0px rgba(0,0,0,0.1);
    }
  </style>
  <atomic-insight-interface>
    <atomic-insight-layout>
      <atomic-layout-section section="search">
        <atomic-insight-search-box></atomic-insight-search-box>
        <atomic-insight-tabs>
          <atomic-insight-tab label="All" expression="" active></atomic-insight-tab>
          <atomic-insight-tab label="Articles" expression="@filetype==html"></atomic-insight-tab>
        </atomic-insight-tabs>
      </atomic-layout-section>
      <atomic-layout-section section="facets">
        <atomic-insight-facet field="source" label="Source"></atomic-insight-facet>
        <atomic-insight-facet field="filetype" label="File Type"></atomic-insight-facet>
      </atomic-layout-section>
      <atomic-layout-section section="status">
        <atomic-insight-query-summary></atomic-insight-query-summary>
      </atomic-layout-section>
      <atomic-layout-section section="results">
        <atomic-insight-result-list image-size="none">
          <atomic-insight-result-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <atomic-result-fields-list>
                  <atomic-field-condition if-defined="source">
                    <atomic-result-text field="source"></atomic-result-text>
                  </atomic-field-condition>
                </atomic-result-fields-list>
              </atomic-result-section-bottom-metadata>
            </template>
          </atomic-insight-result-template>
        </atomic-insight-result-list>
        <atomic-insight-no-results></atomic-insight-no-results>
        <atomic-insight-query-error></atomic-insight-query-error>
      </atomic-layout-section>
      <atomic-layout-section section="pagination">
        <atomic-insight-pager></atomic-insight-pager>
      </atomic-layout-section>
    </atomic-insight-layout>
  </atomic-insight-interface>
`);
