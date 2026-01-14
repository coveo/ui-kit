import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();
const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-refine-modal',
  {excludeCategories: ['methods']}
);
const facetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px;">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-insight-refine-modal',
  title: 'Insight/Refine Modal',
  id: 'atomic-insight-refine-modal',
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
        height: '600px',
      },
    },
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  args: {
    ...args,
  },
  argTypes,
  play: async (context) => {
    await play(context);
    const {canvasElement, step, userEvent} = context;
    const refineToggleElement = within(
      canvasElement.querySelector('atomic-insight-refine-toggle')!
    );
    const refineToggleButton = await refineToggleElement.findByShadowRole(
      'button',
      {
        name: 'Filters',
      }
    );
    // Small await to make sure everything is loaded in and the facets are registered for the modal to render them.
    await new Promise((resolve) => setTimeout(resolve, 300));
    await step('Open refine modal', async () => {
      await userEvent.click(refineToggleButton);
    });
    // It's tough to wait exactly for the modal to be visible because of animations. Thus, we add a small delay here.
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
};

export default meta;

export const Default: Story = {
  decorators: [
    () => html`
     <atomic-insight-refine-toggle></atomic-insight-refine-toggle>
      <div style="display:none;">
        <atomic-insight-facet field="author" label="Authors"></atomic-insight-facet>
        <atomic-insight-facet field="language" label="Language"></atomic-insight-facet>
        <atomic-insight-facet
          field="objecttype"
          label="Type"
          display-values-as="link"
        ></atomic-insight-facet>
        <atomic-insight-facet
          field="year"
          label="Year"
          display-values-as="box"
        ></atomic-insight-facet>
      </div>
    `,
    decorator,
    facetWidthDecorator,
  ],
};
