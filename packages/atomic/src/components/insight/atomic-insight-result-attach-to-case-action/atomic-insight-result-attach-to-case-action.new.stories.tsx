import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {
  baseSearchResponse,
  MockInsightApi,
} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes} = getStorybookHelpers(
  'atomic-insight-result-attach-to-case-action',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-result-attach-to-case-action',
  title: 'Insight/Result Attach To Case Action',
  id: 'atomic-insight-result-attach-to-case-action',
  decorators: [decorator],
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
  },
  argTypes,
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.clear();
    insightApiHarness.searchEndpoint.mockOnce(() => baseSearchResponse);
  },
  play,
};

export default meta;

export const Default: Story = {
  render: () => html`
    <atomic-insight-result-list>
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-actions>
            <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
          </atomic-result-section-actions>
        </template>
      </atomic-insight-result-template>
    </atomic-insight-result-list>
  `,
};

export const WithOtherActions: Story = {
  name: 'With other actions',
  render: () => html`
    <atomic-insight-result-list>
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-actions>
            <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
            <atomic-result-copy-to-clipboard
              text-to-copy="https://example.com"
            ></atomic-result-copy-to-clipboard>
          </atomic-result-section-actions>
        </template>
      </atomic-insight-result-template>
    </atomic-insight-result-list>
  `,
};
