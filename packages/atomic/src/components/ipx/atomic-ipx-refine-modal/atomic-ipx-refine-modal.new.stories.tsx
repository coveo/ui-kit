import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-refine-modal',
  {excludeCategories: ['methods']}
);
const facetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px; margin: auto;">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-ipx-refine-modal',
  title: 'IPX/Refine Modal',
  id: 'atomic-ipx-refine-modal',
  render: (args) => template(args),
  parameters: {
    ...commonParameters,
    actions: {
      handles: events,
    },
    docs: {
      ...commonParameters.docs,
      story: {
        ...commonParameters.docs?.story,
      },
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args: {
    ...args,
    'collapse-facets-after': '0',
  },
  argTypes,
  play: async (context) => {
    await play(context);
    const {canvasElement, step, userEvent} = context;
    const refineToggleElement = within(
      canvasElement.querySelector('atomic-ipx-refine-toggle')!
    );
    const refineToggleButton = await refineToggleElement.findByShadowRole(
      'button',
      {
        name: 'Filters',
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    await step('Open refine modal', async () => {
      await userEvent.click(refineToggleButton);
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
};

export default meta;

export const Default: Story = {
  render: () => html`
    <style>
      atomic-ipx-modal {
        position: relative;
        inset: auto;
      }
    </style>
    <atomic-ipx-modal is-open>
      <div slot="header" style="padding-bottom: 0.875rem;">
        <atomic-layout-section section="search">
          <atomic-ipx-refine-toggle></atomic-ipx-refine-toggle>
        </atomic-layout-section>
      </div>
      <atomic-layout-section section="facets">
        <atomic-facet field="author" label="Author"></atomic-facet>
        <atomic-facet field="source" label="Source"></atomic-facet>
        <atomic-facet field="filetype" label="File Type"></atomic-facet>
      </atomic-layout-section>
      <div slot="body"></div>
      <div slot="footer"></div>
    </atomic-ipx-modal>
  `,
  decorators: [decorator, facetWidthDecorator],
};
