import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {
  playExecuteFirstSearch,
  wrapInSearchInterface,
} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-load-more-results',
  title: 'Atomic/LoadMoreResults',
  id: 'atomic-load-more-results',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-load-more-results',
};

export const InPage: Story = {
  name: 'In a page',
  decorators: [
    (story) =>
      html`<atomic-search-layout>
        <div class="header-bg"></div>
        <atomic-layout-section section="search">
          <atomic-search-box></atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-automatic-facet-generator
              desired-count="3"
            ></atomic-automatic-facet-generator>
            <atomic-category-facet
              field="geographicalhierarchy"
              label="World Atlas"
              with-search
            ></atomic-category-facet>
            <atomic-facet field="author" label="Authors"></atomic-facet>
            <atomic-facet
              field="source"
              label="Source"
              display-values-as="link"
            ></atomic-facet>
            <atomic-facet
              field="year"
              label="Year"
              display-values-as="box"
            ></atomic-facet>
            <atomic-numeric-facet
              field="ytviewcount"
              label="Youtube Views"
              depends-on-filetype="YouTubeVideo"
              with-input="integer"
            ></atomic-numeric-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-breadbox></atomic-breadbox>
            <atomic-query-summary></atomic-query-summary>
            <atomic-refine-toggle></atomic-refine-toggle>
            <atomic-sort-dropdown>
              <atomic-sort-expression
                label="relevance"
                expression="relevancy"
              ></atomic-sort-expression>
            </atomic-sort-dropdown>
            <atomic-did-you-mean></atomic-did-you-mean>
            <atomic-notifications></atomic-notifications>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-smart-snippet></atomic-smart-snippet>
            <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
            <atomic-result-list>
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

                    .thumbnail {
                      display: none;
                      width: 100%;
                      height: 100%;
                    }

                    .icon {
                      display: none;
                    }

                    .result-root.image-small .thumbnail,
                    .result-root.image-large .thumbnail {
                      display: inline-block;
                    }

                    .result-root.image-icon .icon {
                      display: inline-block;
                    }

                    .result-root.image-small atomic-result-section-visual,
                    .result-root.image-large atomic-result-section-visual {
                      border-radius: var(--atomic-border-radius-xl);
                    }
                  </style>
                  <atomic-result-section-actions
                    ><atomic-quickview></atomic-quickview
                  ></atomic-result-section-actions>
                  <atomic-result-section-visual image-size="small">
                    <atomic-result-icon></atomic-result-icon>
                    <img
                      loading="lazy"
                      src="https://picsum.photos/350"
                      class="thumbnail"
                    />
                  </atomic-result-section-visual>
                  <atomic-result-section-title
                    ><atomic-result-link></atomic-result-link
                  ></atomic-result-section-title>
                  <atomic-result-section-excerpt
                    ><atomic-result-text field="excerpt"></atomic-result-text
                  ></atomic-result-section-excerpt>
                  <atomic-result-section-bottom-metadata>
                    <atomic-result-fields-list>
                      <atomic-field-condition class="field" if-defined="author">
                        <span class="field-label"
                          ><atomic-text value="Author"></atomic-text>:</span
                        >
                        <atomic-result-text field="author"></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="source">
                        <span class="field-label"
                          ><atomic-text value="Source"></atomic-text>:</span
                        >
                        <atomic-result-text field="source"></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition
                        class="field"
                        if-defined="language"
                      >
                        <span class="field-label"
                          ><atomic-text value="Language"></atomic-text>:</span
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
                          ><atomic-text value="File Type"></atomic-text>:</span
                        >
                        <atomic-result-text
                          field="filetype"
                        ></atomic-result-text>
                      </atomic-field-condition>
                    </atomic-result-fields-list>
                  </atomic-result-section-bottom-metadata>
                </template>
              </atomic-result-template>
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>`,
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};
