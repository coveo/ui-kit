import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {
  baseFoldedResponse,
  MockInsightApi,
} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-result-children',
  title: 'Insight/Result Children',
  id: 'atomic-insight-result-children',
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.clear();
    mockInsightApi.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  play,
};

export default meta;

export const Default: Story = {
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-folded-result-list
          image-size="small"
          display="list"
          collection-field="foldingcollection"
          parent-field="foldingparent"
          child-field="foldingchild"
        >
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
      </atomic-layout-section>
    </atomic-insight-layout>
  `,
};

export const WithInheritTemplates: Story = {
  name: 'With inherit-templates',
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-folded-result-list
          image-size="small"
          display="list"
          collection-field="foldingcollection"
          parent-field="foldingparent"
          child-field="foldingchild"
        >
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
                      <atomic-result-section-children>
                        <atomic-insight-result-children inherit-templates>
                        </atomic-insight-result-children>
                      </atomic-result-section-children>
                    </template>
                  </atomic-insight-result-children-template>
                </atomic-insight-result-children>
              </atomic-result-section-children>
            </template>
          </atomic-insight-result-template>
        </atomic-insight-folded-result-list>
      </atomic-layout-section>
    </atomic-insight-layout>
  `,
};

export const WithCustomNoResultText: Story = {
  name: 'With custom no-result-text',
  render: () => html`
    <atomic-insight-layout>
      <atomic-layout-section section="results">
        <atomic-insight-folded-result-list
          image-size="small"
          display="list"
          collection-field="foldingcollection"
          parent-field="foldingparent"
          child-field="foldingchild"
        >
          <atomic-insight-result-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-children>
                <atomic-insight-result-children
                  image-size="icon"
                  no-result-text="No related documents found"
                >
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
      </atomic-layout-section>
    </atomic-insight-layout>
  `,
};
