/* eslint-disable @cspell/spellchecker */

import type {
  Decorator,
  Meta,
  StoryObj as Story,
  StoryContext,
} from '@storybook/web-components-vite';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  title: 'Atomic/DidYouMean',
  id: 'atomic-did-you-mean',
  component: 'atomic-did-you-mean',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
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
  play: (context) => searchPlay(context, 'coveoo'),
};

export const QueryTrigger: Story = {
  decorators: [searchBoxDecorator],
  play: (context) => searchPlay(context, 'Japan'),
};
