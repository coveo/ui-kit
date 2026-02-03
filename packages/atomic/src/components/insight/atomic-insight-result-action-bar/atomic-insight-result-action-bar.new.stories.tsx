import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

const meta: Meta = {
  component: 'atomic-insight-result-action-bar',
  title: 'Insight/atomic-insight-result-action-bar',
  id: 'atomic-insight-result-action-bar',
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
};

export default meta;

const {decorator: insightInterfaceDecorator, play: initializeInsightInterface} =
  wrapInInsightInterface();

export const Default: Story = {
  name: 'default',
  decorators: [
    (story) => html`
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
                ${story()}
              </template>
            </atomic-insight-result-template>
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,
    insightInterfaceDecorator,
  ],
  render: () => html`
    <atomic-insight-result-action-bar>
      <button class="btn-primary">Action 1</button>
      <button class="btn-secondary">Action 2</button>
    </atomic-insight-result-action-bar>
  `,
  play: initializeInsightInterface,
};

export const Empty: Story = {
  name: 'empty',
  decorators: [
    (story) => html`
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
                ${story()}
              </template>
            </atomic-insight-result-template>
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,
    insightInterfaceDecorator,
  ],
  render: () => html`
    <atomic-insight-result-action-bar>
      <!-- Empty - should be hidden -->
    </atomic-insight-result-action-bar>
  `,
  play: initializeInsightInterface,
};
