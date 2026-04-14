import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {
  baseFoldedResponse,
  MockSearchApi,
  nestedFoldedResponse,
} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-folded-result-list/atomic-folded-result-list.js';
import '@/src/components/search/atomic-result-children/atomic-result-children.js';
import '@/src/components/search/atomic-result-children-template/atomic-result-children-template.js';
import '@/src/components/search/atomic-result-link/atomic-result-link.js';
import '@/src/components/search/atomic-result-section-children/atomic-result-section-children.js';
import '@/src/components/search/atomic-result-section-excerpt/atomic-result-section-excerpt.js';
import '@/src/components/search/atomic-result-section-title/atomic-result-section-title.js';
import '@/src/components/search/atomic-result-template/atomic-result-template.js';
import '@/src/components/search/atomic-result-text/atomic-result-text.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.mock(() => baseFoldedResponse);

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
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mock(() => nestedFoldedResponse);
    return () => {
      searchApiHarness.searchEndpoint.reset();
      searchApiHarness.searchEndpoint.mock(() => baseFoldedResponse);
    };
  },
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
