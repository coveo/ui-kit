import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockAnswerApi} from '@/storybook-utils/api/answer/mock';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockedAnswerApi = new MockAnswerApi();
const mockedInsightApi = new MockInsightApi();
mockedInsightApi.searchEndpoint.mock((response) => ({
  ...response,
  extendedResults: {
    generativeQuestionAnsweringId: 'fbc64016-5f04-4a47-aad1-0bccaa2c0616',
  },
}));

const {args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-generated-answer',
  {excludeCategories: ['methods']}
);

const layoutDecorator: Decorator = (story) => html`
  <atomic-insight-layout>
    <atomic-layout-section section="search">
      <atomic-insight-search-box></atomic-insight-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="results">
      ${story()}
    </atomic-layout-section>
  </atomic-insight-layout>
`;

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-generated-answer',
  title: 'Insight/Generated Answer',
  id: 'atomic-insight-generated-answer',
  render: (args) => template(args),
  decorators: [layoutDecorator, decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockedInsightApi.handlers, ...mockedAnswerApi.handlers],
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
    const query = 'how to resolve netflix connection with tivo';
    const input = searchBox[0] as HTMLTextAreaElement;
    input.scrollIntoView({block: 'center'});
    input.focus();
    input.value = query;
    input.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        composed: true,
        data: query,
        inputType: 'insertText',
      })
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        key: 'Enter',
        code: 'Enter',
      })
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
