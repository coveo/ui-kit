import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInRecommendationInterface} from '@/storybook-utils/search/recs-interface-wrapper';

const mockedSearchApi = new MockSearchApi();

mockedSearchApi.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 1),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator, play} = wrapInRecommendationInterface();

const buildTemplate = (innerContent: string) => `
  <atomic-recs-list display="list" density="normal" image-size="none">
    <atomic-recs-result-template>
      <template>
        ${innerContent}
      </template>
    </atomic-recs-result-template>
  </atomic-recs-list>
`;

const defaultTemplate = `<atomic-result-section-title>
  <atomic-ipx-result-link></atomic-ipx-result-link>
</atomic-result-section-title>
<atomic-result-section-excerpt>
  <atomic-result-text field="excerpt"></atomic-result-text>
</atomic-result-section-excerpt>`;

const customTextTemplate = `<atomic-result-section-title>
  <atomic-ipx-result-link>
    <atomic-result-text field="title"></atomic-result-text>
    - With Custom Link Text
  </atomic-ipx-result-link>
</atomic-result-section-title>
<atomic-result-section-excerpt>
  <atomic-result-text field="excerpt"></atomic-result-text>
</atomic-result-section-excerpt>`;

const hrefTemplateTemplate = `<atomic-result-section-title>
  <atomic-ipx-result-link href-template="\${clickUri}?source=ipx"></atomic-ipx-result-link>
</atomic-result-section-title>
<atomic-result-section-excerpt>
  <atomic-result-text field="excerpt"></atomic-result-text>
</atomic-result-section-excerpt>`;

const targetBlankTemplate = `<atomic-result-section-title>
  <atomic-ipx-result-link>
    <a slot="attributes" target="_blank" rel="noopener"></a>
  </atomic-ipx-result-link>
</atomic-result-section-title>
<atomic-result-section-excerpt>
  <atomic-result-text field="excerpt"></atomic-result-text>
</atomic-result-section-excerpt>`;

const meta: Meta = {
  component: 'atomic-ipx-result-link',
  title: 'IPX/Ipx Result Link',
  id: 'atomic-ipx-result-link',
  render: (args: {templateContent?: string}) =>
    html`${unsafeHTML(buildTemplate(args.templateContent || defaultTemplate))}`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockedSearchApi.handlers],
    },
  },
  beforeEach: () => {
    mockedSearchApi.searchEndpoint.clear();
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
  play,
};

export const WithCustomText: Story = {
  name: 'With custom link text',
  args: {
    templateContent: customTextTemplate,
  },
  play,
};

export const WithHrefTemplate: Story = {
  name: 'With href template',
  args: {
    templateContent: hrefTemplateTemplate,
  },
  play,
};

export const WithTargetBlank: Story = {
  name: 'With target="_blank"',
  args: {
    templateContent: targetBlankTemplate,
  },
  play,
};
