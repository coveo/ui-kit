import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {
  baseFoldedResponse,
  MockInsightApi,
} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes} = getStorybookHelpers(
  'atomic-insight-result-children',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-result-children',
  title: 'Insight/Result Children',
  id: 'atomic-insight-result-children',
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
    insightApiHarness.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  play,
};

export default meta;

export const Default: Story = {
  render: () => html`
    <atomic-insight-folded-result-list>
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-children>
            <atomic-insight-result-children image-size="icon">
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
        </template>
      </atomic-insight-result-template>
    </atomic-insight-folded-result-list>
  `,
};
