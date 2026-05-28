import type {
  Decorator,
  Meta,
  StoryObj as Story,
  StoryContext,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {userEvent, waitFor} from 'storybook/test';
import {testHoverContentA11y} from '@/storybook-utils/a11y/hover-content.js';
import {MockAgentApi} from '@/storybook-utils/api/agent/mock';
import {MockAnswerApi} from '@/storybook-utils/api/answer/mock';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-generated-answer/atomic-generated-answer.js';
import '@/src/components/common/atomic-layout-section/atomic-layout-section.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-search-box/atomic-search-box.js';
import '@/src/components/search/atomic-search-layout/atomic-search-layout.js';

const mockedAgentApi = new MockAgentApi();
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
  disableStateReflectionInUrl: true,
});

// Legacy config play function for specific stories
const {play: playWithLegacyAnalytics} = wrapInSearchInterface({
  config: configWithLegacyAnalytics,
  disableStateReflectionInUrl: true,
});

const generatedAnswerQuery = 'how to resolve netflix connection with tivo';

async function submitGeneratedAnswerQuery(storyContext: StoryContext) {
  const searchBox =
    await storyContext.canvas.findByShadowPlaceholderText('Search');
  await userEvent.type(searchBox, `${generatedAnswerQuery}{enter}`);
}

const meta: Meta = {
  component: 'atomic-generated-answer',
  title: 'Search/Generated Answer',
  id: 'atomic-generated-answer',
  render: (args) => template(args),
  decorators: [layoutDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [
        ...mockedSearchApi.handlers,
        ...mockedAnswerApi.handlers,
        ...mockedAgentApi.handlers,
      ],
    },
  },
  args: {
    ...args,
  },
  argTypes,

  play: async (storyContext) => {
    await play(storyContext);
    await submitGeneratedAnswerQuery(storyContext);
  },
};

export default meta;

export const Default: Story = {
  args: {
    'answer-configuration-id': 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
  },
};

export const DisableCitationAnchoring: Story = {
  name: 'Citation anchoring disabled',
  args: {
    'disable-citation-anchoring': true,
    'answer-configuration-id': 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
  },
};

export const WithLegacyAnalytics: Story = {
  name: 'With Legacy Analytics',
  args: {
    'answer-configuration-id': 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
  },
  play: async (storyContext) => {
    await playWithLegacyAnalytics(storyContext);
    await submitGeneratedAnswerQuery(storyContext);
  },
};

export const WithAgentId: Story = {
  name: 'With Agent ID',
  args: {
    'agent-id': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'answer-configuration-id': undefined,
  },
  play: async (storyContext) => {
    await playWithLegacyAnalytics(storyContext);
    await submitGeneratedAnswerQuery(storyContext);
  },
};

export const A11yHoverContent: Story = {
  name: 'A11y Hover Content (Citation Popover)',
  tags: ['a11y', 'test'],
  args: {
    'answer-configuration-id': 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
  },
  play: async (context) => {
    await play(context);
    await submitGeneratedAnswerQuery(context);

    // Wait for citations to render inside atomic-generated-answer's shadow DOM
    let citationLink!: HTMLElement;
    await waitFor(
      () => {
        const genAnswer = context.canvasElement.querySelector(
          'atomic-generated-answer'
        );
        const citation =
          genAnswer?.shadowRoot?.querySelector('atomic-citation');
        const link =
          citation?.shadowRoot?.querySelector<HTMLElement>('[part="citation"]');
        if (!link) throw new Error('Citation link not yet rendered');
        citationLink = link;
      },
      {timeout: 10000}
    );

    await testHoverContentA11y(context, {
      findTrigger: async () => citationLink,
      findContent: async (canvasElement) => {
        const genAnswer = canvasElement.querySelector(
          'atomic-generated-answer'
        );
        const citation =
          genAnswer?.shadowRoot?.querySelector('atomic-citation');
        const popover = citation?.shadowRoot?.querySelector<HTMLElement>(
          '[part="citation-popover"]'
        );
        if (!popover) return null;
        if (popover.classList.contains('hidden')) return null;
        const style = getComputedStyle(popover);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return null;
        }
        return popover;
      },
    });
  },
};
