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
  'atomic-insight-folded-result-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-folded-result-list',
  title: 'Insight/Folded Result List',
  id: 'atomic-insight-folded-result-list',
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
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  render: () => html`
    <atomic-insight-folded-result-list>
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
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

export const WithNoResultChildren: Story = {
  name: 'With no result children',
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [
        {
          ...baseFoldedResponse.results[0],
          parentResult: null,
          totalNumberOfChildResults: 0,
          childResults: [],
        },
      ] as unknown as typeof baseFoldedResponse.results,
    }));
  },
  render: () => html`
    <atomic-insight-folded-result-list>
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
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

export const WithResultChildren: Story = {
  name: 'With result children',
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [
        {
          ...baseFoldedResponse.results[0]!,
          totalNumberOfChildResults: 1,
        },
        ...baseFoldedResponse.results.slice(1),
      ],
    }));
  },
  render: () => html`
    <atomic-insight-folded-result-list>
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
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

export const WithCompactDensity: Story = {
  name: 'With compact density',
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  render: () => html`
    <atomic-insight-folded-result-list density="compact">
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-children>
            <atomic-insight-result-children image-size="icon">
              <atomic-insight-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                </template>
              </atomic-insight-result-children-template>
            </atomic-insight-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-insight-result-template>
    </atomic-insight-folded-result-list>
  `,
};

export const WithComfortableDensity: Story = {
  name: 'With comfortable density',
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  render: () => html`
    <atomic-insight-folded-result-list density="comfortable">
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-children>
            <atomic-insight-result-children image-size="icon">
              <atomic-insight-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                </template>
              </atomic-insight-result-children-template>
            </atomic-insight-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-insight-result-template>
    </atomic-insight-folded-result-list>
  `,
};

export const WithSmallImageSize: Story = {
  name: 'With small image size',
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  render: () => html`
    <atomic-insight-folded-result-list image-size="small">
      <atomic-insight-result-template>
        <template>
          <atomic-result-section-visual>
            <atomic-result-image
              fallback="https://picsum.photos/seed/picsum/350"
            ></atomic-result-image>
          </atomic-result-section-visual>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-children>
            <atomic-insight-result-children image-size="small">
              <atomic-insight-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                </template>
              </atomic-insight-result-children-template>
            </atomic-insight-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-insight-result-template>
    </atomic-insight-folded-result-list>
  `,
};
