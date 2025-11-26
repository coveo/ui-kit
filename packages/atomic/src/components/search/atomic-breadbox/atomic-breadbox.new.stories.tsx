import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {expect, waitFor} from 'storybook/test';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-breadbox',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-breadbox',
  title: 'Search/Breadbox',
  id: 'atomic-breadbox',

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

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-breadbox',
  decorators: [
    (story) => html`
      ${story()}
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
        <atomic-facet
          field="filetype"
          style="flex-grow:1"
          label="File type"
        ></atomic-facet>
        <atomic-facet
          field="source"
          style="flex-grow:1"
          label="Source"
        ></atomic-facet>
      </div>
    `,
  ],
  play: async (context) => {
    await play(context);
    const {canvas, step} = context;
    await step('Wait for the facet values to render', async () => {
      await waitFor(
        () => expect(canvas.getByShadowTitle('People')).toBeInTheDocument(),
        {
          timeout: 30e3,
        }
      );
    });
  },
};
