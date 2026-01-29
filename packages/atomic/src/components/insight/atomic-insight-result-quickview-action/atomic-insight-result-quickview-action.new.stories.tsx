import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import {wrapInInsightLayout} from '@/storybook-utils/insight/insight-layout-wrapper';
import {wrapInInsightResultList} from '@/storybook-utils/insight/insight-result-list-wrapper';
import {wrapInInsightResultTemplate} from '@/storybook-utils/insight/insight-result-template-wrapper';

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
  false
);
const {decorator: insightLayoutDecorator} = wrapInInsightLayout(false);
const {decorator: insightResultListDecorator} = wrapInInsightResultList(
  'list',
  false
);
const {decorator: insightResultTemplateDecorator} =
  wrapInInsightResultTemplate(false);

const {events, args, argTypes, template, styleTemplate} = getStorybookHelpers(
  'atomic-insight-result-quickview-action',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-result-quickview-action',
  title: 'Insight/Result Quickview Action',
  id: 'atomic-insight-result-quickview-action',
  render: (args) => html`
    ${styleTemplate(args)}
    <atomic-result-section-actions id="code-root">
      ${template(args)}
    </atomic-result-section-actions>
  `,
  decorators: [
    (story) => html`
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
      ${story()}
    `,
    insightResultTemplateDecorator,
    insightResultListDecorator,
    insightLayoutDecorator,
    insightInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const CustomSandbox: Story = {
  name: 'With custom sandbox attributes',
  args: {
    sandbox:
      'allow-scripts allow-popups allow-top-navigation allow-same-origin',
  },
};
