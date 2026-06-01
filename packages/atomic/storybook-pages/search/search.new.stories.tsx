import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';
import {isTestMode} from '@/storybook-utils/common/is-test-mode';
import '@/src/components/search/atomic-automatic-facet-generator/atomic-automatic-facet-generator.js';
import '@/src/components/search/atomic-breadbox/atomic-breadbox.js';
import '@/src/components/search/atomic-category-facet/atomic-category-facet.js';
import '@/src/components/search/atomic-color-facet/atomic-color-facet.js';
import '@/src/components/search/atomic-did-you-mean/atomic-did-you-mean.js';
import '@/src/components/search/atomic-facet/atomic-facet.js';
import '@/src/components/search/atomic-facet-manager/atomic-facet-manager.js';
import '@/src/components/search/atomic-field-condition/atomic-field-condition.js';
import '@/src/components/common/atomic-layout-section/atomic-layout-section.js';
import '@/src/components/search/atomic-no-results/atomic-no-results.js';
import '@/src/components/search/atomic-notifications/atomic-notifications.js';
import '@/src/components/search/atomic-numeric-facet/atomic-numeric-facet.js';
import '@/src/components/common/atomic-numeric-range/atomic-numeric-range.js';
import '@/src/components/search/atomic-pager/atomic-pager.js';
import '@/src/components/search/atomic-popover/atomic-popover.js';
import '@/src/components/search/atomic-query-error/atomic-query-error.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-quickview/atomic-quickview.js';
import '@/src/components/search/atomic-rating-facet/atomic-rating-facet.js';
import '@/src/components/search/atomic-rating-range-facet/atomic-rating-range-facet.js';
import '@/src/components/search/atomic-refine-toggle/atomic-refine-toggle.js';
import '@/src/components/search/atomic-result-badge/atomic-result-badge.js';
import '@/src/components/search/atomic-result-date/atomic-result-date.js';
import '@/src/components/search/atomic-result-fields-list/atomic-result-fields-list.js';
import '@/src/components/search/atomic-result-image/atomic-result-image.js';
import '@/src/components/search/atomic-result-link/atomic-result-link.js';
import '@/src/components/search/atomic-result-list/atomic-result-list.js';
import '@/src/components/search/atomic-result-multi-value-text/atomic-result-multi-value-text.js';
import '@/src/components/search/atomic-result-number/atomic-result-number.js';
import '@/src/components/search/atomic-result-printable-uri/atomic-result-printable-uri.js';
import '@/src/components/search/atomic-result-rating/atomic-result-rating.js';
import '@/src/components/search/atomic-result-section-actions/atomic-result-section-actions.js';
import '@/src/components/search/atomic-result-section-badges/atomic-result-section-badges.js';
import '@/src/components/search/atomic-result-section-bottom-metadata/atomic-result-section-bottom-metadata.js';
import '@/src/components/search/atomic-result-section-excerpt/atomic-result-section-excerpt.js';
import '@/src/components/search/atomic-result-section-title/atomic-result-section-title.js';
import '@/src/components/search/atomic-result-section-title-metadata/atomic-result-section-title-metadata.js';
import '@/src/components/search/atomic-result-section-visual/atomic-result-section-visual.js';
import '@/src/components/search/atomic-result-template/atomic-result-template.js';
import '@/src/components/search/atomic-result-text/atomic-result-text.js';
import '@/src/components/search/atomic-result-timespan/atomic-result-timespan.js';
import '@/src/components/search/atomic-results-per-page/atomic-results-per-page.js';
import '@/src/components/search/atomic-search-box/atomic-search-box.js';
import '@/src/components/search/atomic-search-box-query-suggestions/atomic-search-box-query-suggestions.js';
import '@/src/components/search/atomic-search-box-recent-queries/atomic-search-box-recent-queries.js';
import '@/src/components/search/atomic-search-interface/atomic-search-interface.js';
import '@/src/components/search/atomic-search-layout/atomic-search-layout.js';
import '@/src/components/search/atomic-segmented-facet/atomic-segmented-facet.js';
import '@/src/components/search/atomic-segmented-facet-scrollable/atomic-segmented-facet-scrollable.js';
import '@/src/components/search/atomic-smart-snippet/atomic-smart-snippet.js';
import '@/src/components/search/atomic-smart-snippet-suggestions/atomic-smart-snippet-suggestions.js';
import '@/src/components/search/atomic-sort-dropdown/atomic-sort-dropdown.js';
import '@/src/components/search/atomic-sort-expression/atomic-sort-expression.js';
import '@/src/components/search/atomic-text/atomic-text.js';
import '@/src/components/common/atomic-timeframe/atomic-timeframe.js';
import '@/src/components/search/atomic-tab-manager/atomic-tab-manager.js';
import '@/src/components/search/atomic-tab/atomic-tab.js';
import '@/src/components/search/atomic-timeframe-facet/atomic-timeframe-facet.js';

// const mockSearchApi = new MockSearchApi();

const meta: Meta = {
  component: 'rich-search-page',
  title: 'Search/Example Pages',
  id: 'rich-search-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    // mockSearchApi.searchEndpoint.mock(
    //   () => richResponse as unknown as typeof baseResponse
    // );
  },
  render: () => html`
    <atomic-search-interface
      language-assets-path="./lang"
      icon-assets-path="./assets"
      .analytics=${isTestMode()}
    >
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box>
            <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
            <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
          </atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-facet
              field="year"
              label="Year"
              tabs-excluded='["article"]'
            ></atomic-facet>
            <atomic-numeric-facet
              field="ytviewcount"
              label="YouTube Views"
              with-input="integer"
              tabs-excluded='["article"]'
            ></atomic-numeric-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-tab-manager clear-filters-on-tab-change="false">
            <atomic-tab name="all" label="All"></atomic-tab>
            <atomic-tab name="article" label="Articles"></atomic-tab>
          </atomic-tab-manager>
          <atomic-layout-section section="horizontal-facets">
            <atomic-segmented-facet-scrollable>
              <atomic-segmented-facet
                field="objecttype"
                label="Object Type"
              ></atomic-segmented-facet>
            </atomic-segmented-facet-scrollable>
            <atomic-popover>
              <atomic-facet field="concepts" label="Concepts"></atomic-facet>
            </atomic-popover>
          </atomic-layout-section>
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
                label="Most Recent"
                expression="date descending"
              ></atomic-sort-expression>
              <atomic-sort-expression
                label="Oldest"
                expression="date ascending"
              ></atomic-sort-expression>
            </atomic-sort-dropdown>
            <atomic-did-you-mean></atomic-did-you-mean>
            <atomic-notifications></atomic-notifications>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-smart-snippet></atomic-smart-snippet>
            <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
            <atomic-result-list
              display="list"
              density="normal"
              image-size="small"
            >
              <atomic-result-template>
                <template>
                  <style>
                    .field {
                      display: inline-flex;
                      align-items: center;
                    }
                    .field-label {
                      font-weight: bold;
                      margin-right: 0.25rem;
                    }
                  </style>
                  <atomic-result-section-actions>
                    <atomic-quickview></atomic-quickview>
                  </atomic-result-section-actions>
                  <atomic-result-section-badges>
                    <atomic-result-badge
                      icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg"
                    >
                      <atomic-result-multi-value-text
                        field="language"
                      ></atomic-result-multi-value-text>
                    </atomic-result-badge>
                    <atomic-field-condition must-match-is-recommendation="true">
                      <atomic-result-badge
                        label="Recommended"
                      ></atomic-result-badge>
                    </atomic-field-condition>
                    <atomic-field-condition must-match-is-top-result="true">
                      <atomic-result-badge
                        label="Top Result"
                      ></atomic-result-badge>
                    </atomic-field-condition>
                  </atomic-result-section-badges>
                  <atomic-result-section-visual>
                    <atomic-result-image
                      field="ytthumbnailurl"
                      fallback="https://picsum.photos/seed/picsum/350"
                    ></atomic-result-image>
                  </atomic-result-section-visual>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-title-metadata>
                    <atomic-field-condition class="field" if-defined="snrating">
                      <atomic-result-rating
                        field="snrating"
                      ></atomic-result-rating>
                    </atomic-field-condition>
                    <atomic-field-condition
                      class="field"
                      if-not-defined="snrating"
                    >
                      <atomic-result-printable-uri
                        max-number-of-parts="3"
                      ></atomic-result-printable-uri>
                    </atomic-field-condition>
                  </atomic-result-section-title-metadata>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                  <atomic-result-section-bottom-metadata>
                    <atomic-result-fields-list>
                      <atomic-field-condition class="field" if-defined="author">
                        <span class="field-label"
                          ><atomic-text value="author"></atomic-text>:</span
                        >
                        <atomic-result-multi-value-text
                          field="author"
                        ></atomic-result-multi-value-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="source">
                        <span class="field-label"
                          ><atomic-text value="source"></atomic-text>:</span
                        >
                        <atomic-result-text field="source"></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition
                        class="field"
                        if-defined="language"
                      >
                        <span class="field-label"
                          ><atomic-text value="language"></atomic-text>:</span
                        >
                        <atomic-result-multi-value-text
                          field="language"
                        ></atomic-result-multi-value-text>
                      </atomic-field-condition>
                      <atomic-field-condition
                        class="field"
                        if-defined="filetype"
                      >
                        <span class="field-label"
                          ><atomic-text value="fileType"></atomic-text>:</span
                        >
                        <atomic-result-text
                          field="filetype"
                        ></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition
                        class="field"
                        if-defined="ytviewcount"
                      >
                        <span class="field-label">Views:</span>
                        <atomic-result-number
                          field="ytviewcount"
                        ></atomic-result-number>
                      </atomic-field-condition>
                      <atomic-field-condition
                        class="field"
                        if-defined="ytlikecount"
                      >
                        <span class="field-label">Likes:</span>
                        <atomic-result-number
                          field="ytlikecount"
                        ></atomic-result-number>
                      </atomic-field-condition>
                      <atomic-field-condition
                        class="field"
                        if-defined="videoduration"
                      >
                        <span class="field-label">Duration:</span>
                        <atomic-result-timespan
                          field="videoduration"
                        ></atomic-result-timespan>
                      </atomic-field-condition>
                      <span class="field">
                        <span class="field-label">Date:</span>
                        <atomic-result-date
                          format="ddd MMM D YYYY"
                        ></atomic-result-date>
                      </span>
                    </atomic-result-fields-list>
                  </atomic-result-section-bottom-metadata>
                </template>
              </atomic-result-template>
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-pager></atomic-pager>
            <atomic-results-per-page></atomic-results-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    </atomic-search-interface>
  `,
  play: async (context) => {
    await customElements.whenDefined('atomic-search-interface');
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    console.log('Start search interface initialization');
    await searchInterface!.initialize(getSampleSearchEngineConfiguration());
    console.log('Search interface initialized, executing first search');
    await searchInterface!.executeFirstSearch();
  },
};

export default meta;

export const Default: Story = {
  name: 'Search Page',
};
