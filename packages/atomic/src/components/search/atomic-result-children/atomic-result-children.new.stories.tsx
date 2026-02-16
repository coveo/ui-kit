import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {baseFoldedResponse} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-result-children',
  title: 'Search/Result Children',
  id: 'atomic-result-children',
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  play,
};

export default meta;

export const Default: Story = {
  render: () => html`
    <atomic-folded-result-list>
      <atomic-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-children>
            <atomic-result-children image-size="icon">
              <atomic-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-template>
    </atomic-folded-result-list>
  `,
};

export const WithInheritTemplates: Story = {
  name: 'With inherit-templates',
  render: () => html`
    <atomic-folded-result-list>
      <atomic-result-template>
        <template>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-children>
            <atomic-result-children image-size="icon">
              <atomic-result-children-template>
                <template>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-children>
                    <atomic-result-children inherit-templates>
                    </atomic-result-children>
                  </atomic-result-section-children>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-template>
    </atomic-folded-result-list>
  `,
};
