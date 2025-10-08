import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-tab-manager',
  {excludeCategories: ['methods']}
);

const {decorator, afterEach} = wrapInSearchInterface({
  search: {
    // eslint-disable-next-line @cspell/spellchecker
    pipeline: 'genqatest',
    preprocessSearchResponseMiddleware: (r) => {
      const [result] = r.body.results;
      result.title = 'Manage the Coveo In-Product Experiences (IPX)';
      result.clickUri = 'https://docs.coveo.com/en/3160';
      r.body.questionAnswer = {
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: result.raw.permanentid!,
        },
        question: 'Creating an In-Product Experience (IPX)',
        answerSnippet: `
          <ol>
            <li>On the <a href="https://platform.cloud.coveo.com/admin/#/orgid/search/in-app-widgets/">In-Product Experiences</a> page, click Add <b>In-Product Experience</b>.</li>
            <li>In the Configuration tab, fill the Basic settings section.</li>
            <li>(Optional) Use the Design and Content access tabs to <a href="https://docs.coveo.com/en/3160/#customizing-an-ipx-interface">customize your <b>IPX</b> interface</a>.</li>
            <li>Click Save.</li>
            <li>In the Loader snippet panel that appears, you may click Copy to save the loader snippet for your <b>IPX</b> to your clipboard, and then click Save.  You can Always retrieve the loader snippet later.</li>
          </ol>

          <p>
            You're now ready to <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#embed-your-ipx-interface-in-sites-and-applications">embed your IPX interface</a>. However, we recommend that you <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#configuring-query-pipelines-for-an-ipx-interface-recommended">configure query pipelines for your IPX interface</a> before.
          </p>
        `,
        relatedQuestions: [],
        score: 1337,
      };
      return r;
    },
  },
});

const meta: Meta = {
  component: 'atomic-tab-manager',
  title: 'Search/Tabs',
  id: 'atomic-tab-manager',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,

  afterEach,
  args: {
    ...args,
    'default-slot': `
      <atomic-tab name="all" label="All" tab></atomic-tab>
      <atomic-tab name="documentation" label="Documentation"></atomic-tab>
      <atomic-tab name="article" label="Articles"></atomic-tab>
      <atomic-tab name="parts" label="Parts and Accessories"></atomic-tab>
    `,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-tab-manager',
  decorators: [
    (story) => html`
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box></atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facets>
            <atomic-facet field="objecttype" label="Object type"></atomic-facet>
            <atomic-facet
              tabs-included='["article"]'
              field="filetype"
              label="File type (included facet)"
            ></atomic-facet>
            <atomic-facet
              tabs-excluded='["article"]'
              field="source"
              label="Source (excluded facet)"
            ></atomic-facet>
            <atomic-category-facet
              tabs-included='["article"]'
              field="geographicalhierarchy"
              label="World Atlas"
              with-search
            ></atomic-category-facet>
            <atomic-category-facet
              tabs-excluded='["article"]'
              field="geographicalhierarchy"
              label="World Atlas"
            ></atomic-category-facet>
            <atomic-color-facet
              tabs-included='["article"]'
              field="filetype"
              label="Files"
              number-of-values="6"
              sort-criteria="occurrences"
            ></atomic-color-facet>
            <atomic-color-facet
              tabs-excluded='["article"]'
              field="filetype"
              label="Files"
              number-of-values="6"
              sort-criteria="occurrences"
            ></atomic-color-facet>
            <atomic-rating-facet
              tabs-included='["article"]'
              field="snrating"
              label="Rating"
              number-of-intervals="5"
            ></atomic-rating-facet>
            <atomic-rating-facet
              tabs-excluded='["article"]'
              field="snrating"
              label="Rating"
              number-of-intervals="5"
            ></atomic-rating-facet>
            <atomic-rating-range-facet
              tabs-included='["article"]'
              facet-id="snrating_range"
              field="snrating"
              label="Rating Range (auto)"
              number-of-intervals="5"
            ></atomic-rating-range-facet>
            <atomic-rating-range-facet
              tabs-excluded='["article"]'
              facet-id="snrating_range_2"
              field="snrating"
              label="Rating Range (auto)"
              number-of-intervals="5"
            ></atomic-rating-range-facet>
            <atomic-timeframe-facet
              tabs-included='["article"]'
              label="Timeframe"
              with-date-picker
            >
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
              ></atomic-timeframe
            ></atomic-timeframe-facet>
            <atomic-timeframe-facet
              tabs-excluded='["article"]'
              label="Timeframe"
              with-date-picker
            >
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
              ></atomic-timeframe
            ></atomic-timeframe-facet>
          </atomic-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          ${story()}
          <atomic-layout-section section="horizontal-facets">
            <atomic-segmented-facet-scrollable>
              <atomic-segmented-facet
                tabs-included='["article"]'
                field="inat_kingdom"
                label="Kingdom"
              ></atomic-segmented-facet>
            </atomic-segmented-facet-scrollable>
            <atomic-segmented-facet-scrollable>
              <atomic-segmented-facet
                tabs-excluded='["article"]'
                field="inat_kingdom"
                label="Kingdom"
              ></atomic-segmented-facet>
            </atomic-segmented-facet-scrollable>
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
              <atomic-sort-expression
                tabs-excluded='["article"]'
                label="Name descending"
                expression="name descending"
              ></atomic-sort-expression>
              <atomic-sort-expression
                tabs-excluded='["article"]'
                label="Name ascending"
                expression="name ascending"
              ></atomic-sort-expression>
              <atomic-sort-expression
                tabs-included='["article"]'
                label="Most Recent"
                expression="date descending"
              ></atomic-sort-expression>
              <atomic-sort-expression
                tabs-included='["article"]'
                label="Least Recent"
                expression="date ascending"
              ></atomic-sort-expression>

            </atomic-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="results">
          <atomic-generated-answer tabs-included='["article", "documentation"]'></atomic-generated-answer>
            <atomic-smart-snippet
              tabs-included='["article", "documentation"]'
              style="padding: 10px"
            ></atomic-smart-snippet>
            <atomic-result-list
              tabs-included='["article"]'
              display="list"
              density="compact"
              image-size="small"
              data-testid="included-result-list"
            >
              <atomic-result-template>
                <template>
                  <atomic-result-section-actions
                    ><atomic-quickview></atomic-quickview
                  ></atomic-result-section-actions>
                  <atomic-result-section-visual>
                    <img src="https://picsum.photos/seed/coveo/350" class="thumbnail" />
                  </atomic-result-section-visual>
                  <atomic-result-section-title
                    ><atomic-result-link></atomic-result-link
                  ></atomic-result-section-title>
                  <atomic-result-section-excerpt>
                    "included result list"
                    <atomic-result-text field="excerpt"></atomic-result-text
                  ></atomic-result-section-excerpt>
                </template>
              </atomic-result-template>
            </atomic-result-list>
                <atomic-result-list
              tabs-excluded='["article"]'
              display="grid"
              density="normal"
              image-size="icon"
              data-testid="excluded-result-list"
            >
              <atomic-result-template>
                <template>
                  <atomic-result-section-actions
                    ><atomic-quickview></atomic-quickview
                  ></atomic-result-section-actions>
                   <atomic-result-section-visual>
                    <img src="https://picsum.photos/seed/coveo/400" alt="SomeResultPicture" class="thumbnail" />
                  </atomic-result-section-visual>
                  <atomic-result-section-title
                    ><atomic-result-link></atomic-result-link
                  ></atomic-result-section-title>
                  <atomic-result-section-excerpt>
                    "excluded result list"
                    <atomic-result-text field="excerpt"></atomic-result-text
                  ></atomic-result-section-excerpt>
                </template>
              </atomic-result-template>
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination"></atomic-layout-section>

      </atomic-search-layout>
    `,
  ],
};
