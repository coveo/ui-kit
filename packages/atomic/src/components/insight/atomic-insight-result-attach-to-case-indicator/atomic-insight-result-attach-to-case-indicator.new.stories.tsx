import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes} = getStorybookHelpers(
  'atomic-insight-result-attach-to-case-indicator',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-result-attach-to-case-indicator',
  title: 'Insight/Result Attach To Case Indicator',
  id: 'atomic-insight-result-attach-to-case-indicator',
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
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'In a result list',
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-result-list display="list" density="normal">
          <atomic-insight-result-template>
            <template>
              <atomic-result-section-badges>
                <atomic-insight-result-attach-to-case-indicator></atomic-insight-result-attach-to-case-indicator>
              </atomic-result-section-badges>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-insight-result-template>
        </atomic-insight-result-list>
      </atomic-layout-section>
    </atomic-insight-layout>
  `,
};
