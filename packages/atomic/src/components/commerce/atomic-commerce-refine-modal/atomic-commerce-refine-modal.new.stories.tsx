import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, styleTemplate} = getStorybookHelpers(
  'atomic-commerce-refine-modal',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-refine-modal',
  title: 'Commerce/Refine Modal',
  id: 'atomic-commerce-refine-modal',
  render: (args) =>
    html`${styleTemplate(args)}<atomic-commerce-refine-toggle></atomic-commerce-refine-toggle>`,
  decorators: [decorator],
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
  argTypes: {
    ...argTypes,
    'open-button': {
      ...argTypes['open-button'],
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    'is-open': {
      ...argTypes['is-open'],
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    'collapse-facets-after': {
      ...argTypes['collapse-facets-after'],
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
  },
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
    const {canvasElement, canvas, step, userEvent} = context;
    const refineToggleElement = within(
      canvasElement.querySelector('atomic-commerce-refine-toggle')!
    );
    const refineToggleButton = await refineToggleElement.findByShadowRole(
      'button',
      {
        name: 'Sort & Filter',
      }
    );
    await step('Open refine modal', async () => {
      await userEvent.click(refineToggleButton);
      await expect(
        await canvas.findByShadowText(
          'Relevance',
          {exact: false},
          {timeout: 10e3}
        )
      ).toBeVisible();
    });
    await step('Wait for modal to be fully rendered', async () => {
      // Wait for the modal footer button to be in the document
      // This ensures the modal animation is complete and all content is rendered
      await waitFor(
        () =>
          expect(
            canvas.getByShadowText(/view products/i, {exact: false})
          ).toBeInTheDocument(),
        {timeout: 10e3}
      );
    });
  },
};

export default meta;

export const DefaultModal: Story = {
  name: 'Default modal',
};
