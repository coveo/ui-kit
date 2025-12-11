import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  playExecuteFirstSearch,
  wrapInSearchInterface,
} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface({
  config: {
    accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
    organizationId: 'fashioncoveodemocomgzh7iep8',
    search: {
      searchHub: 'MainSearch',
    },
  },
  skipFirstSearch: true,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Search/Searchbox/atomic-search-box',
  id: 'atomic-search-box',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-search-box',
};

export const RichSearchBox: Story = {
  name: 'With recent queries and instant results',
  args: {
    'default-slot': ` <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      <atomic-search-box-instant-results
        image-size="small"
      ></atomic-search-box-instant-results>`,
  },
};

export const InPage: Story = {
  name: 'In a page',
  decorators: [
    (story) =>
      html`<atomic-search-layout>
        <div class="header-bg"></div>
        <atomic-layout-section section="search">
          ${story()}
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
            >
            </atomic-category-facet>
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
            <atomic-numeric-facet
              field="ytlikecount"
              label="Youtube Likes"
              depends-on-filetype="YouTubeVideo"
              display-values-as="link"
            >
              <atomic-numeric-range
                start="0"
                end="1000"
                label="Unpopular"
              ></atomic-numeric-range>
              <atomic-numeric-range
                start="1000"
                end="8000"
                label="Well liked"
              ></atomic-numeric-range>
              <atomic-numeric-range
                start="8000"
                end="100000"
                label="Popular"
              ></atomic-numeric-range>
              <atomic-numeric-range
                start="100000"
                end="999999999"
                label="Treasured"
              ></atomic-numeric-range>
            </atomic-numeric-facet>
            <atomic-numeric-facet field="sncost" label="Cost Range (auto)">
              <atomic-format-currency currency="CAD"></atomic-format-currency>
            </atomic-numeric-facet>
            <atomic-timeframe-facet label="Timeframe" with-date-picker>
              <atomic-timeframe unit="hour"></atomic-timeframe>
              <atomic-timeframe unit="day"></atomic-timeframe>
              <atomic-timeframe unit="week"></atomic-timeframe>
              <atomic-timeframe unit="month"></atomic-timeframe>
              <atomic-timeframe unit="quarter"></atomic-timeframe>
              <atomic-timeframe unit="year"></atomic-timeframe>
              <atomic-timeframe
                unit="year"
                amount="10"
                period="next"
              ></atomic-timeframe>
            </atomic-timeframe-facet>
            <atomic-rating-facet
              field="snrating"
              label="Rating"
              number-of-intervals="5"
            >
            </atomic-rating-facet>
            <atomic-rating-range-facet
              facet-id="snrating_range"
              field="snrating"
              label="Rating Range (auto)"
              number-of-intervals="5"
            >
            </atomic-rating-range-facet>
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
              <atomic-segmented-facet
                field="inat_kingdom"
                label="Kingdom"
              ></atomic-segmented-facet>
            </atomic-segmented-facet-scrollable>
            <atomic-popover>
              <atomic-facet
                field="inat_family"
                label="Family"
                sort-criteria="alphanumericDescending"
              ></atomic-facet>
            </atomic-popover>
            <atomic-popover>
              <atomic-facet field="inat_class" label="Class"></atomic-facet>
            </atomic-popover>
          </atomic-layout-section>
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
            <atomic-did-you-mean
              query-correction-mode="next"
            ></atomic-did-you-mean>
            <atomic-notifications></atomic-notifications>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-smart-snippet></atomic-smart-snippet>
            <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
            <atomic-result-list>
              <atomic-result-template must-match-sourcetype="YouTube">
                <template>
                  <atomic-result-section-actions
                    ><atomic-quickview></atomic-quickview
                  ></atomic-result-section-actions>
                  <atomic-result-section-visual image-size="small">
                    <img
                      loading="lazy"
                      src="https://picsum.photos/seed/picsum/350"
                      class="thumbnail"
                    />
                  </atomic-result-section-visual>
                  <atomic-result-section-title
                    ><atomic-result-link></atomic-result-link
                  ></atomic-result-section-title>
                  <atomic-result-section-excerpt
                    ><atomic-result-text field="excerpt"></atomic-result-text
                  ></atomic-result-section-excerpt>
                </template>
              </atomic-result-template>

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

                    .salesforce-badge::part(result-badge-element) {
                      background-color: #44a1da;
                      color: white;
                    }
                  </style>
                  <atomic-result-section-actions
                    ><atomic-quickview></atomic-quickview
                  ></atomic-result-section-actions>
                  <atomic-result-section-visual>
                    <atomic-result-icon class="icon"></atomic-result-icon>
                    <img
                      loading="lazy"
                      src="https://picsum.photos/seed/picsum/350"
                      class="thumbnail"
                    />
                  </atomic-result-section-visual>
                  <atomic-result-section-badges>
                    <atomic-field-condition must-match-sourcetype="Salesforce">
                      <atomic-result-badge
                        label="Salesforce"
                        class="salesforce-badge"
                      ></atomic-result-badge>
                    </atomic-field-condition>
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
                  <atomic-result-section-title
                    ><atomic-result-link></atomic-result-link
                  ></atomic-result-section-title>
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
                  <atomic-result-section-excerpt
                    ><atomic-result-text field="excerpt"></atomic-result-text
                  ></atomic-result-section-excerpt>
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

                      <atomic-field-condition class="field" if-defined="sncost">
                        <span class="field-label">Cost:</span>
                        <atomic-result-number field="sncost">
                          <atomic-format-currency
                            currency="CAD"
                          ></atomic-format-currency>
                        </atomic-result-number>
                      </atomic-field-condition>

                      <span class="field">
                        <span class="field-label">Date:</span>
                        <atomic-result-date
                          format="ddd MMM D YYYY"
                        ></atomic-result-date>
                      </span>
                    </atomic-result-fields-list>
                  </atomic-result-section-bottom-metadata>
                  <atomic-table-element label="Description">
                    <atomic-result-section-title
                      ><atomic-result-link></atomic-result-link
                    ></atomic-result-section-title>
                    <atomic-result-section-title-metadata>
                      <atomic-field-condition
                        class="field"
                        if-defined="snrating"
                      >
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
                  </atomic-table-element>
                  <atomic-table-element label="author">
                    <atomic-result-multi-value-text
                      field="author"
                    ></atomic-result-multi-value-text>
                  </atomic-table-element>
                  <atomic-table-element label="source">
                    <atomic-result-text field="source"></atomic-result-text>
                  </atomic-table-element>
                  <atomic-table-element label="language">
                    <atomic-result-multi-value-text
                      field="language"
                    ></atomic-result-multi-value-text>
                  </atomic-table-element>
                  <atomic-table-element label="file-type">
                    <atomic-result-text field="filetype"></atomic-result-text>
                  </atomic-table-element>
                </template>
              </atomic-result-template>
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-load-more-results></atomic-load-more-results>
            <!-- Alternative pagination
              <atomic-pager></atomic-pager>
              <atomic-results-per-page></atomic-results-per-page>
              -->
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>`,
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};
