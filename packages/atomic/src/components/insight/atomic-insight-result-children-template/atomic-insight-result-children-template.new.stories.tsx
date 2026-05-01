import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {
  baseFoldedResponse,
  MockInsightApi,
  nestedFoldedResponse,
} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import {wrapInInsightFoldedResultList} from '@/storybook-utils/insight/insight-result-list-wrapper';
import {wrapInInsightResultTemplate} from '@/storybook-utils/insight/insight-result-template-wrapper';
import '@/src/components/insight/atomic-insight-result-children/atomic-insight-result-children.js';
import '@/src/components/insight/atomic-insight-result-children-template/atomic-insight-result-children-template.js';
import '@/src/components/search/atomic-result-badge/atomic-result-badge.js';
import '@/src/components/search/atomic-result-link/atomic-result-link.js';
import '@/src/components/search/atomic-result-section-badges/atomic-result-section-badges.js';
import '@/src/components/search/atomic-result-section-children/atomic-result-section-children.js';
import '@/src/components/search/atomic-result-section-excerpt/atomic-result-section-excerpt.js';
import '@/src/components/search/atomic-result-section-title/atomic-result-section-title.js';
import '@/src/components/search/atomic-result-text/atomic-result-text.js';

const insightApiHarness = new MockInsightApi();
insightApiHarness.searchEndpoint.mock(() => baseFoldedResponse);

const CHILDREN_TEMPLATE_EXAMPLE = `<template>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
</template>`;

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-result-children-template',
  {excludeCategories: ['methods']}
);

const {decorator: insightInterfaceDecorator, play} = wrapInInsightInterface(
  {},
  false,
  false
);
const {decorator: insightFoldedResultListDecorator} =
  wrapInInsightFoldedResultList('list', false);
const {decorator: insightResultTemplateDecorator} =
  wrapInInsightResultTemplate(false);

const meta: Meta = {
  component: 'atomic-insight-result-children-template',
  title: 'Insight/Result Children Template',
  id: 'atomic-insight-result-children-template',
  render: (args) => html`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        ${template(args)}
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,
  decorators: [
    insightResultTemplateDecorator,
    insightFoldedResultListDecorator,
    insightInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  args: {
    ...args,
    'default-slot': CHILDREN_TEMPLATE_EXAMPLE,
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
  play,
};

export default meta;

export const Default: Story = {};

export const WithNestedChildren: Story = {
  name: 'With nested children',
  render: () => html`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        <atomic-insight-result-children-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
            <atomic-result-section-excerpt>
              <atomic-result-text field="excerpt"></atomic-result-text>
            </atomic-result-section-excerpt>
            <atomic-result-section-children>
              <atomic-insight-result-children
                inherit-templates
              ></atomic-insight-result-children>
            </atomic-result-section-children>
          </template>
        </atomic-insight-result-children-template>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mock(() => nestedFoldedResponse);
    return () => {
      insightApiHarness.searchEndpoint.reset();
      insightApiHarness.searchEndpoint.mock(() => baseFoldedResponse);
    };
  },
};

export const WithConditions: Story = {
  name: 'With conditions',
  render: () => html`
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children image-size="icon">
        <!-- Template for specific source types -->
        <atomic-insight-result-children-template
          must-match-sourcetype="YouTube"
        >
          <template>
            <atomic-result-section-badges>
              <atomic-result-badge label="YouTube"></atomic-result-badge>
            </atomic-result-section-badges>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
          </template>
        </atomic-insight-result-children-template>
        <!-- Default template -->
        <atomic-insight-result-children-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
            <atomic-result-section-excerpt>
              <atomic-result-text field="excerpt"></atomic-result-text>
            </atomic-result-section-excerpt>
          </template>
        </atomic-insight-result-children-template>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,
};
