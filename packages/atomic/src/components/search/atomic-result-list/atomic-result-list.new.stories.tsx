import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  playExecuteFirstSearch,
  wrapInSearchInterface,
} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-field-condition/atomic-field-condition.js';
import '@/src/components/search/atomic-quickview/atomic-quickview.js';
import '@/src/components/search/atomic-result-badge/atomic-result-badge.js';
import '@/src/components/search/atomic-result-date/atomic-result-date.js';
import '@/src/components/search/atomic-result-fields-list/atomic-result-fields-list.js';
import '@/src/components/search/atomic-result-icon/atomic-result-icon.js';
import '@/src/components/search/atomic-result-link/atomic-result-link.js';
import '@/src/components/search/atomic-result-list/atomic-result-list.js';
import '@/src/components/search/atomic-result-multi-value-text/atomic-result-multi-value-text.js';
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
import '@/src/components/search/atomic-table-element/atomic-table-element.js';
import '@/src/components/search/atomic-text/atomic-text.js';

const defaultTemplateContent = `<atomic-result-template>
  <template>
      <atomic-result-section-actions><atomic-quickview></atomic-quickview></atomic-result-section-actions>
      <atomic-result-section-visual>
        <atomic-result-icon class="icon"></atomic-result-icon>
        <img loading="lazy" src="https://picsum.photos/seed/picsum/350" class="thumbnail" />
      </atomic-result-section-visual>
      <atomic-result-section-badges>
        <atomic-field-condition must-match-sourcetype="Salesforce">
          <atomic-result-badge label="Salesforce" class="salesforce-badge"></atomic-result-badge>
        </atomic-field-condition>
        <atomic-result-badge
          icon="https://cdn.jsdelivr.net/npm/@material-icons/svg@1.0.11/svg/translate/baseline.svg"
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
      <atomic-result-section-title><atomic-result-link></atomic-result-link></atomic-result-section-title>
      <atomic-result-section-title-metadata>
        <atomic-field-condition class="field" if-defined="snrating">
          <atomic-result-rating field="snrating"></atomic-result-rating>
        </atomic-field-condition>
        <atomic-field-condition class="field" if-not-defined="snrating">
          <atomic-result-printable-uri max-number-of-parts="3"></atomic-result-printable-uri>
        </atomic-field-condition>
      </atomic-result-section-title-metadata>
      <atomic-result-section-excerpt
        ><atomic-result-text field="excerpt"></atomic-result-text
      ></atomic-result-section-excerpt>
      <atomic-result-section-bottom-metadata>
        <atomic-result-fields-list>
          <atomic-field-condition class="field" if-defined="source">
            <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
            <atomic-result-text field="source"></atomic-result-text>
          </atomic-field-condition>
          </span>
        </atomic-result-fields-list>
      </atomic-result-section-bottom-metadata>
  </template>
</atomic-result-template>`;

const {decorator, play} = wrapInSearchInterface({
  config: {
    search: {
      preprocessSearchResponseMiddleware: (r) => {
        const [result] = r.body.results;
        result.title = 'Manage the Coveo In-Product Experiences (IPX)';
        result.clickUri = 'https://docs.coveo.com/en/3160';
        return r;
      },
    },
  },
});

const {play: playNoFirstQuery} = wrapInSearchInterface({
  skipFirstSearch: true,
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-list',
  {excludeCategories: ['methods']}
);

const {play: playNoResults} = wrapInSearchInterface({
  skipFirstSearch: false,
  config: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.query = 'show me no result';
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

const meta: Meta = {
  component: 'atomic-result-list',
  title: 'Search/Result List',
  id: 'atomic-result-list',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    layout: 'fullscreen',
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'number-of-placeholders': 10,
    display: 'list',
    density: 'normal',
    'image-size': 'small',
  },
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  name: 'Using list display',
};

export const ListDisplayWithTemplate: Story = {
  name: 'Using list display with template',
  args: {
    'default-slot': defaultTemplateContent,
  },
};

export const ListDisplayBeforeQuery: Story = {
  name: 'Using list display before query',
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const GridDisplay: Story = {
  name: 'Using grid display',
  args: {
    display: 'grid',
  },
};

export const GridDisplayWithTemplate: Story = {
  name: 'Using grid display with template',
  args: {
    display: 'grid',
    'default-slot': defaultTemplateContent,
  },
};

export const GridDisplayBeforeQuery: Story = {
  name: 'Using grid display before query',
  args: {
    display: 'grid',
  },
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const TableDisplay: Story = {
  name: 'Using table display',
  args: {
    display: 'table',
    'default-slot': `<atomic-result-template>
  <template>
    <atomic-table-element label="Result">
      <atomic-result-link></atomic-result-link>
      <atomic-result-field-condition if-defined="source">
        <atomic-result-text field="source" class="text-neutral-dark block"></atomic-result-text>
      </atomic-result-field-condition>
    </atomic-table-element>
    <atomic-table-element label="ID">
      <atomic-result-text field="permanentid"></atomic-result-text>
    </atomic-table-element>
    <atomic-table-element label="Date">
       <atomic-result-date field="date" class="text-neutral-dark block"></atomic-result-date>
    </atomic-table-element>
  </template>
</atomic-result-template>`,
  },
};

export const TableDisplayBeforeQuery: Story = {
  name: 'Using table display before query',
  args: {
    display: 'table',
  },
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const NoResults: Story = {
  tags: ['!dev'],
  name: 'No results',
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoResults(context);
    await playExecuteFirstSearch(context);
  },
};
