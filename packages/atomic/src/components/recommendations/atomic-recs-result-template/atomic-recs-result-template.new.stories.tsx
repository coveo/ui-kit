import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInRecommendationInterface} from '@/storybook-utils/search/recs-interface-wrapper';

const mockedSearchApi = new MockSearchApi();

mockedSearchApi.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 10),
  totalCount: 10,
  totalCountFiltered: 10,
}));

const TEMPLATE_EXAMPLE = `<template>
  <atomic-result-section-visual>
    <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
  </atomic-result-section-visual>
  <atomic-result-section-badges>
    <atomic-field-condition must-match-sourcetype="YouTube">
      <atomic-result-badge
        label="YouTube"
        class="youtube-badge"
      ></atomic-result-badge>
    </atomic-field-condition>
  </atomic-result-section-badges>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label">
          <atomic-text value="source"></atomic-text>:
        </span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label">
          <atomic-text value="author"></atomic-text>:
        </span>
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="date">
        <span class="field-label">
          <atomic-text value="date"></atomic-text>:
        </span>
        <atomic-result-date></atomic-result-date>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
</template>`;

const MINIMAL_TEMPLATE = `<template>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
</template>`;

const {decorator, play} = wrapInRecommendationInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-recs-result-template',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-recs-result-template',
  title: 'Recommendations/Recs Result Template',
  id: 'atomic-recs-result-template',
  render: (renderArgs) => template(renderArgs),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockedSearchApi.handlers],
    },
  },
  beforeEach: () => {
    mockedSearchApi.searchEndpoint.clear();
  },
  args: {
    ...args,
    'default-slot': TEMPLATE_EXAMPLE,
  },
  argTypes: {
    ...argTypes,
    'must-match': {
      ...argTypes['must-match'],
      control: false,
    },
    'must-not-match': {
      ...argTypes['must-not-match'],
      control: false,
    },
    conditions: {
      ...argTypes.conditions,
      control: false,
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'In a recs list',
  decorators: [
    (story) => html`
      <atomic-recs-list display="list" density="normal" image-size="icon">
        ${story()}
      </atomic-recs-list>
    `,
    decorator,
  ],
  play,
};

export const WithMinimalTemplate: Story = {
  name: 'With minimal template',
  args: {
    'default-slot': MINIMAL_TEMPLATE,
  },
  decorators: [
    (story) => html`
      <atomic-recs-list display="list" density="normal" image-size="none">
        ${story()}
      </atomic-recs-list>
    `,
    decorator,
  ],
  play,
};

export const WithLinkSlot: Story = {
  name: 'With link slot',
  args: {
    'default-slot': `<template slot="link">
      <atomic-result-link>
        <a slot="attributes" target="_blank"></a>
      </atomic-result-link>
    </template>
    <template>
      <atomic-result-section-title>
        <atomic-result-text field="title"></atomic-result-text>
      </atomic-result-section-title>
    </template>`,
  },
  decorators: [
    (story) => html`
      <atomic-recs-list display="list" density="normal" image-size="none">
        ${story()}
      </atomic-recs-list>
    `,
    decorator,
  ],
  play,
};
