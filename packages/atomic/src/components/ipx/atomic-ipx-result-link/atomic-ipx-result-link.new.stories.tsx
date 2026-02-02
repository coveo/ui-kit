import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import type {SearchResponse} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInRecommendationInterface} from '@/storybook-utils/search/recs-interface-wrapper';
import {wrapInRecsResultTemplate} from '@/storybook-utils/search/recs-result-template-wrapper';

const mockedSearchApi = new MockSearchApi();

mockedSearchApi.searchEndpoint.mock((response) => ({
  ...response,
  results: (response as SearchResponse).results.slice(0, 1),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator: recsInterfaceDecorator, play} =
  wrapInRecommendationInterface();
const {decorator: recsResultTemplateDecorator} = wrapInRecsResultTemplate();

const resultSectionDecorator: Decorator = (story) => html`
  <atomic-result-section-title>
    ${story()}
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
`;

const meta: Meta = {
  component: 'atomic-ipx-result-link',
  title: 'IPX/Ipx Result Link',
  id: 'atomic-ipx-result-link',
  render: () => html`<atomic-ipx-result-link></atomic-ipx-result-link>`,
  decorators: [
    resultSectionDecorator,
    recsResultTemplateDecorator,
    recsInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockedSearchApi.handlers],
    },
  },
  beforeEach: () => {
    mockedSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {};

export const WithCustomText: Story = {
  name: 'With custom link text',
  decorators: [
    () => html`
      <atomic-ipx-result-link>
        <atomic-result-text field="title"></atomic-result-text>
        - With Custom Link Text
      </atomic-ipx-result-link>
    `,
  ],
};

export const WithHrefTemplate: Story = {
  name: 'With href template',
  decorators: [
    () => html`
      <atomic-ipx-result-link
        href-template="\${clickUri}?source=ipx"
      ></atomic-ipx-result-link>
    `,
  ],
};

export const WithTargetBlank: Story = {
  name: 'With target="_blank"',
  decorators: [
    () => html`
      <atomic-ipx-result-link>
        <a slot="attributes" target="_blank" rel="noopener"></a>
      </atomic-ipx-result-link>
    `,
  ],
};
