/* eslint-disable @cspell/spellchecker */

import type {
  Decorator,
  Meta,
  StoryObj as Story,
  StoryContext,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-did-you-mean',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  title: 'Search/DidYouMean',
  id: 'atomic-did-you-mean',
  component: 'atomic-did-you-mean',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  afterEach: play,
};

export default meta;

const searchBoxDecorator: Decorator = (story) => html`
  <div style="display: flex; justify-content: flex-start;">
    <atomic-search-box style="flex-grow:1"></atomic-search-box>
  </div>
  ${story()}
`;

const searchPlay: (context: StoryContext, query: string) => Promise<void> =
  async (context, query) => {
    await play(context);
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);

    const searchBox = (
      await canvas.findAllByShadowTitle('Search field with suggestions.', {
        exact: false,
      })
    )?.find(
      (el) => el.getAttribute('part') === 'textarea'
    ) as HTMLTextAreaElement;

    const submitButton = (
      await canvas.findAllByShadowTitle('Search field with suggestions.', {
        exact: false,
      })
    )?.find((el) => el.getAttribute('part') === 'submit-button');

    await step(`Search "${query}"`, async () => {
      await userEvent.type(searchBox!, query);
      await userEvent.click(submitButton!);
    });
  };

export const Default: Story = {
  name: 'atomic-did-you-mean',
  decorators: [searchBoxDecorator],
  afterEach: (context) => searchPlay(context, 'coveoo'),
};

export const QueryTrigger: Story = {
  decorators: [searchBoxDecorator],
  afterEach: (context) => searchPlay(context, 'Japan'),
};
