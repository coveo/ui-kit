import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface({
  search: {
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
  title: 'Atomic/Tabs',
  id: 'atomic-tab-manager',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  args: {
    'slots-default': `
      <atomic-tab name="all" label="All" tab></atomic-tab>
      <atomic-tab name="article" label="Articles"></atomic-tab>
      <atomic-tab name="documentation" label="Documentation"></atomic-tab>
    `,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-tab-manager',
  decorators: [
    (story) => html`
      ${story()}
      <div style="padding:10px;">
        <atomic-sort-dropdown>
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
          <atomic-sort-expression
            label="relevance"
            expression="relevancy"
          ></atomic-sort-expression>
        </atomic-sort-dropdown>
      </div>
      <div style="display: flex;">
        <atomic-smart-snippet
          tabs-included='["article", "documentation"]'
          style="padding: 10px;"
        ></atomic-smart-snippet>
      </div>
      <div style="display: flex;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
        <atomic-facet
          data-testid="included-facet"
          tabs-included='["article"]'
          field="filetype"
          style="flex-grow:1"
          label="File type"
        ></atomic-facet>
        <atomic-facet
          data-testid="excluded-facet"
          tabs-excluded='["article"]'
          field="source"
          style="flex-grow:1"
          label="Source"
        ></atomic-facet>
      </div>
    `,
  ],
};
