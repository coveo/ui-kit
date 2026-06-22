import {pageHtml} from '../fixtures.js';

export const ipxPage = pageHtml(`
  <atomic-search-interface>
    <atomic-ipx-modal is-open="true">
      <div slot="header">
        <atomic-layout-section section="search">
          <atomic-search-box textarea></atomic-search-box>
          <atomic-ipx-refine-toggle></atomic-ipx-refine-toggle>
          <atomic-ipx-tabs>
            <atomic-ipx-tab label="All" expression="" active></atomic-ipx-tab>
            <atomic-ipx-tab label="Articles" expression="@filetype==html"></atomic-ipx-tab>
          </atomic-ipx-tabs>
        </atomic-layout-section>
      </div>
      <atomic-layout-section section="facets">
        <atomic-facet field="source" label="Source"></atomic-facet>
        <atomic-facet field="filetype" label="File Type"></atomic-facet>
      </atomic-layout-section>
      <div slot="body">
        <atomic-layout-section section="status">
          <atomic-query-summary></atomic-query-summary>
          <atomic-did-you-mean></atomic-did-you-mean>
        </atomic-layout-section>
        <atomic-layout-section section="results">
          <atomic-result-list image-size="none">
            <atomic-result-template>
              <template>
                <atomic-result-section-title>
                  <atomic-ipx-result-link></atomic-ipx-result-link>
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
            </atomic-result-template>
          </atomic-result-list>
          <atomic-no-results></atomic-no-results>
          <atomic-query-error></atomic-query-error>
        </atomic-layout-section>
        <atomic-layout-section section="pagination">
          <atomic-load-more-results></atomic-load-more-results>
        </atomic-layout-section>
      </div>
      <div slot="footer">
        <a href="https://coveo.com" target="_blank" style="color: var(--atomic-primary); text-decoration: none;">Powered by Coveo</a>
      </div>
    </atomic-ipx-modal>
    <atomic-ipx-button label="Help"></atomic-ipx-button>
  </atomic-search-interface>
`);
