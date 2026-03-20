import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockAnswerApi} from '@/storybook-utils/api/answer/mock';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-generated-answer/atomic-generated-answer.js';
import '@/src/components/common/atomic-layout-section/atomic-layout-section.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-search-box/atomic-search-box.js';
import '@/src/components/search/atomic-search-layout/atomic-search-layout.js';

const mockedAnswerApi = new MockAnswerApi();
const mockedSearchApi = new MockSearchApi();
mockedSearchApi.searchEndpoint.mock((response) => ({
  ...response,
  extendedResults: {
    generativeQuestionAnsweringId: 'fbc64016-5f04-4a47-aad1-0bccaa2c0616',
  },
}));

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-generated-answer',
  {excludeCategories: ['methods']}
);

const layoutDecorator: Decorator = (story) => html`
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box></atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      ${story()}
      <atomic-layout-section section="status">
        <atomic-query-summary></atomic-query-summary>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
`;

const baseConfig = {
  accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  organizationId: 'searchuisamples',
  search: {
    pipeline: 'genqatest',
  },
};

const configWithLegacyAnalytics = {
  ...baseConfig,
  analytics: {
    analyticsMode: 'legacy' as const,
  },
};

// Use base config for decorator (shared by all stories)
const {decorator, play} = wrapInSearchInterface({
  config: baseConfig,
});

// Legacy config play function for specific stories
const {play: playWithLegacyAnalytics} = wrapInSearchInterface({
  config: configWithLegacyAnalytics,
});

const meta: Meta = {
  component: 'atomic-generated-answer',
  title: 'Reference/Search/Generated Answer',
  id: 'atomic-generated-answer',
  render: (args) => template(args),
  decorators: [layoutDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockedSearchApi.handlers, ...mockedAnswerApi.handlers],
    },
  },
  args: {
    ...args,
    'answer-configuration-id': 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
  },
  argTypes,

  play: async (storyContext) => {
    await play(storyContext);
    const searchBox =
      await storyContext.canvas.findAllByShadowPlaceholderText('Search');
    await storyContext.userEvent.type(
      searchBox[0],
      'how to resolve netflix connection with tivo{enter}'
    );
  },
};

export default meta;

export const Default: Story = {};

export const DisableCitationAnchoring: Story = {
  name: 'Citation anchoring disabled',
  args: {
    'disable-citation-anchoring': true,
  },
};

export const WithLegacyAnalytics: Story = {
  name: 'With Legacy Analytics',
  play: async (storyContext) => {
    await playWithLegacyAnalytics(storyContext);
    const searchBox =
      await storyContext.canvas.findAllByShadowPlaceholderText('Search');
    await storyContext.userEvent.type(
      searchBox[0],
      'how to resolve netflix connection with tivo{enter}'
    );
  },
};
