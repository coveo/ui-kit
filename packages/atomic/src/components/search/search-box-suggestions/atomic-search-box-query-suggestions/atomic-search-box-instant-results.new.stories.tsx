import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box-instant-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-search-box-query-suggestions',
  title: 'Atomic/SearchBox/QuerySuggestions',
  id: 'atomic-search-box-query-suggestions',
  render: (args) => template(args),
  decorators: [
    (story) => html`<atomic-search-box> ${story()} </atomic-search-box>`,
    decorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

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
        ?.find((el) => el.getAttribute('part') === 'textarea')
        ?.focus();
    });
  },
};
