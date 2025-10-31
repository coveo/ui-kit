import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface({
  includeCodeRoot: false,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-refine-modal',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-refine-modal',
  title: 'Commerce/Refine Modal',
  id: 'atomic-commerce-refine-toggle',
  render: (args) => html`${template(args)}`,
  decorators: [
    (story) =>
      html`<atomic-commerce-refine-toggle></atomic-commerce-refine-toggle><div id="code-root">${story()}</div>`,
    decorator,
  ],
  parameters: {
    ...commonParameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'collapse-facets-after': '0',
  },
  argTypes,
  globals: {
    layout: 'fullscreen',
    docs: {
      ...commonParameters.docs,
      story: {
        ...commonParameters.docs?.story,
        height: '1000px',
      },
    },
  },
  play: async (context) => {
    await play(context);
    const refineToggle = await context.canvas.findByShadowRole('button', {
      name: 'Sort & Filter',
    });

    await userEvent.click(refineToggle);
  },
};

export default meta;

export const DefaultModal: Story = {
  name: 'Default modal',
};
