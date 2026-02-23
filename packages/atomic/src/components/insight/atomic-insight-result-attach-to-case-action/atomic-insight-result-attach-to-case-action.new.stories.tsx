import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {
  baseSearchResponse,
  MockInsightApi,
} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();

const {decorator: insightInterfaceDecorator, play} = wrapInInsightInterface(
  {},
  false,
  false
);

const meta: Meta = {
  component: 'atomic-insight-result-attach-to-case-action',
  title: 'Insight/Result Attach To Case Action',
  id: 'atomic-insight-result-attach-to-case-action',
  decorators: [insightInterfaceDecorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.clear();
    insightApiHarness.searchEndpoint.mockOnce(() => ({
      ...baseSearchResponse,
      results: baseSearchResponse.results.slice(0, 8),
    }));
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'In Action Bar',
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-result-list image-size="none">
          <atomic-insight-result-template>
            <template>
              <atomic-insight-result-action-bar id="code-root">
                <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
              </atomic-insight-result-action-bar>
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

export const WithOtherActions: Story = {
  name: 'With Other Actions',
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-result-list image-size="none">
          <atomic-insight-result-template>
            <template>
              <atomic-insight-result-action-bar id="code-root">
                <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
                <atomic-insight-result-action
                  action="copyToClipboard"
                  tooltip="Copy"
                ></atomic-insight-result-action>
                <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
              </atomic-insight-result-action-bar>
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
