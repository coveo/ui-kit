import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

// biome-ignore lint/suspicious/noExplicitAny: Mock API response types are loosely defined
mockInsightApi.searchEndpoint.mock((response: any) => ({
  ...response,
  // biome-ignore lint/suspicious/noExplicitAny: Mock API result types are loosely defined
  results: response.results.slice(0, 3).map((result: any) => ({
    ...result,
    flags: 'HasHtmlVersion;HasThumbnail',
    hasHtmlVersion: true,
  })),
  totalCount: 3,
}));

const {decorator: insightInterfaceDecorator, play} = wrapInInsightInterface(
  {},
  false,
  true
);

const meta: Meta = {
  component: 'atomic-insight-result-quickview-action',
  title: 'Insight/Result Components/Result Quickview Action',
  id: 'atomic-insight-result-quickview-action',

  render: () => html`
    <atomic-insight-layout>
      <atomic-insight-refine-modal></atomic-insight-refine-modal>
      <atomic-layout-section section="main">
        <atomic-layout-section section="horizontal">
          <atomic-layout-section section="results">
            <atomic-insight-result-list>
              <atomic-insight-result-template>
                <template>
                  <atomic-result-section-visual>
                    <atomic-result-image
                      field="ytthumbnailurl"
                      fallback="https://picsum.photos/seed/picsum/350"
                    ></atomic-result-image>
                  </atomic-result-section-visual>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                  <atomic-result-section-actions>
                    <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
                  </atomic-result-section-actions>
                </template>
              </atomic-insight-result-template>
            </atomic-insight-result-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-layout-section>
    </atomic-insight-layout>
    <atomic-quickview-modal></atomic-quickview-modal>
  `,
  decorators: [insightInterfaceDecorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },

  play,
};

export default meta;

export const Default: Story = {};

export const CustomSandbox: Story = {
  name: 'With custom sandbox attributes',
  render: () => html`
    <atomic-insight-layout>
      <atomic-insight-refine-modal></atomic-insight-refine-modal>
      <atomic-layout-section section="main">
        <atomic-layout-section section="horizontal">
          <atomic-layout-section section="results">
            <atomic-insight-result-list>
              <atomic-insight-result-template>
                <template>
                  <atomic-result-section-visual>
                    <atomic-result-image
                      field="ytthumbnailurl"
                      fallback="https://picsum.photos/seed/picsum/350"
                    ></atomic-result-image>
                  </atomic-result-section-visual>
                  <atomic-result-section-title>
                    <atomic-result-link></atomic-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                  <atomic-result-section-actions>
                    <atomic-insight-result-quickview-action
                      sandbox="allow-scripts allow-popups allow-top-navigation allow-same-origin"
                    ></atomic-insight-result-quickview-action>
                  </atomic-result-section-actions>
                </template>
              </atomic-insight-result-template>
            </atomic-insight-result-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-layout-section>
    </atomic-insight-layout>
    <atomic-quickview-modal></atomic-quickview-modal>
  `,
};
