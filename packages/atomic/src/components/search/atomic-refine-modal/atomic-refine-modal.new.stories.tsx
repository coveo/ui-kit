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
  'atomic-refine-modal',
  {excludeCategories: ['methods']}
);
const commerceFacetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px;">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-refine-modal',
  title: 'Search/Refine Modal',
  id: 'atomic-refine-modal',
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
      canvasElement.querySelector('atomic-refine-toggle')!
    );
    const refineToggleButton = await refineToggleElement.findByShadowRole(
      'button',
      {
        name: 'Sort & Filter',
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
     <atomic-refine-toggle></atomic-refine-toggle>
      <div style="display:none;">
        <atomic-sort-dropdown><atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression></atomic-sort-dropdown>
        <atomic-facet field="author" label="Authors"></atomic-facet>
        <atomic-facet field="language" label="Language"></atomic-facet>
        <atomic-facet
          field="objecttype"
          label="Type"
          display-values-as="link"
        ></atomic-facet>
        <atomic-facet
          field="year"
          label="Year"
          display-values-as="box"
        ></atomic-facet>
      </div>
    `,
    decorator,
    commerceFacetWidthDecorator,
  ],
};
