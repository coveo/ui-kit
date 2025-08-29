/* eslint-disable no-missing-import */
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, afterEach} = wrapInInsightInterface({}, false, false);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-refine-modal',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-refine-modal',
  title: 'Atomic/Insight/RefineModal',
  id: 'atomic-insight-refine-modal',
  render: (args) => html`${template(args)}`,
  decorators: [
    (story) =>
      html`<atomic-insight-refine-toggle></atomic-insight-refine-toggle><div id="code-root">${story()}</div>`,
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
  afterEach: async (context) => {
    await afterEach(context);
    const canvas = within(
      context.canvasElement.querySelector('atomic-insight-refine-toggle')!
    );
    const refineToggle = await canvas.findByShadowRole('button', {
      name: 'Sort & Filter',
    });

    await userEvent.click(refineToggle);
  },
};

export default meta;

export const DefaultModal: Story = {
  name: 'Default modal',
};
