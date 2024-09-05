import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-search-box-query-suggestions',
  title: 'Atomic/SearchBox/QuerySuggestions',
  id: 'atomic-search-box-query-suggestions',
  render: renderComponent,
  decorators: [
    (story) => html`<atomic-search-box> ${story()} </atomic-search-box>`,
    decorator,
  ],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-search-box-query-suggestions',
  play: async (context) => {
    await play(context);
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);
    await step('Click Searchbox', async () => {
      (
        await canvas.findAllByShadowTitle('Search field with suggestions.', {
          exact: false,
        })
      )
        ?.find((el) => el.role === 'textbox')
        ?.focus();
    });
  },
};
