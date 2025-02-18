import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import {userEvent} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-search-box-recent-queries',
  title: 'Atomic/SearchBox/RecentQueries',
  id: 'atomic-search-box-recent-queries',
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
  name: 'atomic-search-box-recent-queries',
  play: async (context) => {
    await play(context);
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);
    const searchBox = (
      await canvas.findAllByShadowTitle('Search field with suggestions.', {
        exact: false,
      })
    )?.find((el) => el.getAttribute('part') === 'textarea');
    await step('Search for test', async () => {
      await userEvent.click(searchBox!);
      await userEvent.type(searchBox!, 'test{enter}');
    });
    await step('Clear query', async () => {
      await userEvent.click(
        await canvas.findByShadowRole('button', {name: 'Clear'})
      );
    });
    await step('Click the searchbox', async () => {
      await userEvent.click(searchBox!);
    });
  },
};
