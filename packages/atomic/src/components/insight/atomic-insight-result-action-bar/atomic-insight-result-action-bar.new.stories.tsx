import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-result-action-bar',
  title: 'Insight/Result Action Bar',
  id: 'atomic-insight-result-action-bar',
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  beforeEach: () => {
    insightApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-result-list
          display="list"
          density="normal"
          image-size="icon"
        >
          <atomic-insight-result-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-actions>
                <atomic-insight-result-action-bar>
                  <atomic-insight-result-action
                    tooltip="Copy to Clipboard"
                    action="copyToClipboard"
                  ></atomic-insight-result-action>
                  <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
                </atomic-insight-result-action-bar>
              </atomic-result-section-actions>
            </template>
          </atomic-insight-result-template>
        </atomic-insight-result-list>
      </atomic-layout-section>
    </atomic-insight-layout>
  `,
};

export const WithCopyAction: Story = {
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-result-list
          display="list"
          density="normal"
          image-size="icon"
        >
          <atomic-insight-result-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-actions>
                <atomic-insight-result-action-bar>
                  <atomic-insight-result-action
                    tooltip="Copy to Clipboard"
                    tooltip-on-click="Copied!"
                    action="copyToClipboard"
                  ></atomic-insight-result-action>
                </atomic-insight-result-action-bar>
              </atomic-result-section-actions>
            </template>
          </atomic-insight-result-template>
        </atomic-insight-result-list>
      </atomic-layout-section>
    </atomic-insight-layout>
  `,
};

export const WithAllActions: Story = {
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-result-list
          display="list"
          density="normal"
          image-size="icon"
        >
          <atomic-insight-result-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-actions>
                <atomic-insight-result-action-bar>
                  <atomic-insight-result-action
                    tooltip="Copy to Clipboard"
                    tooltip-on-click="Copied!"
                    action="copyToClipboard"
                  ></atomic-insight-result-action>
                  <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
                  <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
                </atomic-insight-result-action-bar>
              </atomic-result-section-actions>
            </template>
          </atomic-insight-result-template>
        </atomic-insight-result-list>
      </atomic-layout-section>
    </atomic-insight-layout>
  `,
};
