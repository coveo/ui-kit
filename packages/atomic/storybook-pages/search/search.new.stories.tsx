import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeSearchInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const mockSearchApi = new MockSearchApi();

const meta: Meta = {
  component: 'rich-search-page',
  title: 'Search/Example Pages',
  id: 'rich-search-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <atomic-search-interface language-assets-path="./lang" icon-assets-path="./assets">
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box>
            <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
            <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
          </atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-automatic-facet-generator desired-count="3"></atomic-automatic-facet-generator>
            <atomic-category-facet
              field="geographicalhierarchy"
              label="World Atlas"
              with-search
            ></atomic-category-facet>
            <atomic-facet field="author" label="Authors"></atomic-facet>
            <atomic-facet field="source" label="Source" display-values-as="link"></atomic-facet>
            <atomic-facet field="filetype" label="File Type" display-values-as="box"></atomic-facet>
            <atomic-facet field="language" label="Language"></atomic-facet>
            <atomic-facet field="year" label="Year"></atomic-facet>
            <atomic-numeric-facet
              field="ytviewcount"
              label="YouTube Views"
              with-input="integer"
            ></atomic-numeric-facet>
            <atomic-numeric-facet
              field="ytlikecount"
              label="YouTube Likes"
              display-values-as="link"
            >
              <atomic-numeric-range start="0" end="1000" label="Unpopular"></atomic-numeric-range>
              <atomic-numeric-range start="1000" end="8000" label="Well liked"></atomic-numeric-range>
              <atomic-numeric-range start="8000" end="100000" label="Popular"></atomic-numeric-range>
              <atomic-numeric-range start="100000" end="999999999" label="Treasured"></atomic-numeric-range>
            </atomic-numeric-facet>
            <atomic-timeframe-facet label="Timeframe" with-date-picker>
              <atomic-timeframe unit="hour"></atomic-timeframe>
              <atomic-timeframe unit="day"></atomic-timeframe>
              <atomic-timeframe unit="week"></atomic-timeframe>
              <atomic-timeframe unit="month"></atomic-timeframe>
              <atomic-timeframe unit="quarter"></atomic-timeframe>
              <atomic-timeframe unit="year"></atomic-timeframe>
            </atomic-timeframe-facet>
            <atomic-rating-facet
              field="snrating"
              label="Rating"
              number-of-intervals="5"
            ></atomic-rating-facet>
            <atomic-rating-range-facet
              facet-id="snrating_range"
              field="snrating"
              label="Rating Range"
              number-of-intervals="5"
            ></atomic-rating-range-facet>
            <atomic-color-facet
              field="filetype"
              label="Files"
              number-of-values="6"
              sort-criteria="occurrences"
            ></atomic-color-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="horizontal-facets">
            <atomic-segmented-facet-scrollable>
              <atomic-segmented-facet field="objecttype" label="Object Type"></atomic-segmented-facet>
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
              <atomic-sort-expression label="Relevance" expression="relevancy"></atomic-sort-expression>
              <atomic-sort-expression label="Most Recent" expression="date descending"></atomic-sort-expression>
              <atomic-sort-expression label="Oldest" expression="date ascending"></atomic-sort-expression>
            </atomic-sort-dropdown>
            <atomic-did-you-mean></atomic-did-you-mean>
            <atomic-notifications></atomic-notifications>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-smart-snippet></atomic-smart-snippet>
            <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
            <atomic-result-list display="list" density="normal" image-size="small">
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
                      <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
                    </atomic-result-badge>
                    <atomic-field-condition must-match-is-recommendation="true">
                      <atomic-result-badge label="Recommended"></atomic-result-badge>
                    </atomic-field-condition>
                    <atomic-field-condition must-match-is-top-result="true">
                      <atomic-result-badge label="Top Result"></atomic-result-badge>
                    </atomic-field-condition>
                  </atomic-result-section-badges>
                  <atomic-result-section-visual>
                    <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
                  </atomic-result-section-visual>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-title-metadata>
                    <atomic-field-condition class="field" if-defined="snrating">
                      <atomic-result-rating field="snrating"></atomic-result-rating>
                    </atomic-field-condition>
                    <atomic-field-condition class="field" if-not-defined="snrating">
                      <atomic-result-printable-uri max-number-of-parts="3"></atomic-result-printable-uri>
                    </atomic-field-condition>
                  </atomic-result-section-title-metadata>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                  <atomic-result-section-bottom-metadata>
                    <atomic-result-fields-list>
                      <atomic-field-condition class="field" if-defined="author">
                        <span class="field-label"><atomic-text value="author"></atomic-text>:</span>
                        <atomic-result-multi-value-text field="author"></atomic-result-multi-value-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="source">
                        <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
                        <atomic-result-text field="source"></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="language">
                        <span class="field-label"><atomic-text value="language"></atomic-text>:</span>
                        <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="filetype">
                        <span class="field-label"><atomic-text value="fileType"></atomic-text>:</span>
                        <atomic-result-text field="filetype"></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="ytviewcount">
                        <span class="field-label">Views:</span>
                        <atomic-result-number field="ytviewcount"></atomic-result-number>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="ytlikecount">
                        <span class="field-label">Likes:</span>
                        <atomic-result-number field="ytlikecount"></atomic-result-number>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="videoduration">
                        <span class="field-label">Duration:</span>
                        <atomic-result-timespan field="videoduration"></atomic-result-timespan>
                      </atomic-field-condition>
                      <span class="field">
                        <span class="field-label">Date:</span>
                        <atomic-result-date format="ddd MMM D YYYY"></atomic-result-date>
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
    await initializeSearchInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    await searchInterface!.executeFirstSearch();
  },
};

export default meta;

export const Default: Story = {
  name: 'Search Page',
};
