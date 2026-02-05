import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/insight/search-response';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const insightApiHarness = new MockInsightApi();
const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, styleTemplate} = getStorybookHelpers(
  'atomic-insight-refine-modal',
  {excludeCategories: ['methods']}
);
const facetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px;">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-insight-refine-modal',
  title: 'Insight/Refine Modal',
  id: 'atomic-insight-refine-modal',
  render: (args) => html`${styleTemplate(args)}`,
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
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
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
    // Facets call `bindings.store.registerFacet()` during initialization to register themselves with the interface store.
    // The refine modal uses `bindings.store.getAllFacets()` to retrieve and render these registered facets.
    // This delay ensures facets have completed initialization and registration before the modal attempts to render them.
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
        <atomic-insight-facet field="source" label="Source"></atomic-insight-facet>
        <atomic-insight-facet field="filetype" label="File Type"></atomic-insight-facet>
      </div>
    `,
    decorator,
    facetWidthDecorator,
  ],
};
