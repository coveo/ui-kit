import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {testDialogA11y} from '@/storybook-utils/a11y/dialog.js';
import {MockSearchApi} from '@coveo/platform-mock-api/search';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-facet/atomic-facet.js';
import '@/src/components/search/atomic-refine-modal/atomic-refine-modal.js';
import '@/src/components/search/atomic-refine-toggle/atomic-refine-toggle.js';
import '@/src/components/search/atomic-sort-dropdown/atomic-sort-dropdown.js';
import '@/src/components/search/atomic-sort-expression/atomic-sort-expression.js';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-refine-modal', {
  excludeCategories: ['methods'],
});
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
    const refineToggleElement = within(canvasElement.querySelector('atomic-refine-toggle')!);
    const refineToggleButton = await refineToggleElement.findByShadowRole('button', {
      name: 'Sort & Filter',
    });
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

const refineModalDecorators: Decorator[] = [
  () => html`
    <atomic-refine-toggle></atomic-refine-toggle>
    <div style="display:none;">
      <atomic-sort-dropdown
        ><atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression
      ></atomic-sort-dropdown>
      <atomic-facet field="author" label="Authors"></atomic-facet>
      <atomic-facet field="language" label="Language"></atomic-facet>
      <atomic-facet field="objecttype" label="Type" display-values-as="link"></atomic-facet>
      <atomic-facet field="year" label="Year" display-values-as="box"></atomic-facet>
    </div>
  `,
  decorator,
  commerceFacetWidthDecorator,
];

const dependentFacetDecorators: Decorator[] = [
  () => html`
    <atomic-refine-toggle></atomic-refine-toggle>
    <div style="display:none;">
      <atomic-sort-dropdown
        ><atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression
      ></atomic-sort-dropdown>
      <atomic-facet field="filetype" label="File Type"></atomic-facet>
      <atomic-facet
        field="language"
        label="Language (dependent)"
        depends-on-filetype="YouTubeVideo"
      ></atomic-facet>
      <atomic-facet field="objecttype" label="Type"></atomic-facet>
    </div>
  `,
  decorator,
  commerceFacetWidthDecorator,
];

export const Default: Story = {
  decorators: refineModalDecorators,
};

export const DependentFacetOrder: Story = {
  name: 'Dependent Facet Order',
  tags: ['test'],
  decorators: dependentFacetDecorators,
  beforeEach: () => {
    const withFacetState = (state: 'idle' | 'selected') =>
      searchApiHarness.searchEndpoint.mockOnce((response) => ({
        ...response,
        facets: [
          {
            facetId: 'filetype',
            field: 'filetype',
            moreValuesAvailable: false,
            values: [{value: 'YouTubeVideo', state, numberOfResults: 10}],
          },
          {
            facetId: 'language',
            field: 'language',
            moreValuesAvailable: false,
            values: [{value: 'English', state: 'idle', numberOfResults: 5}],
          },
          {
            facetId: 'objecttype',
            field: 'objecttype',
            moreValuesAvailable: false,
            values: [{value: 'Video', state: 'idle', numberOfResults: 10}],
          },
        ],
      }));

    searchApiHarness.searchEndpoint.clear();
    withFacetState('idle');
    withFacetState('selected');
  },
  play: async (context) => {
    await meta.play?.(context);
    const {canvasElement, step, userEvent} = context;
    const refineModal = canvasElement.querySelector('atomic-refine-modal')!;

    await step('Select the parent facet', async () => {
      const parentFacetToggle = await within(refineModal).findByShadowRole('button', {
        name: 'Expand the File Type facet',
      });
      await userEvent.click(parentFacetToggle);
      const parentValue = await within(refineModal).findByShadowLabelText(
        'Inclusion filter on YouTubeVideo',
        {exact: false}
      );
      await userEvent.click(parentValue);
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const facetLabels = Array.from(
      refineModal.querySelector('div[slot="facets"]')?.children ?? []
    ).map((facet) => facet.getAttribute('label'));
    if (facetLabels.join() !== 'File Type,Language (dependent),Type') {
      throw new Error(`Unexpected facet order: ${facetLabels.join()}`);
    }
  },
};

export const A11yDialog: Story = {
  tags: ['a11y', 'test', '!dev'],
  name: 'A11y Dialog',
  decorators: refineModalDecorators,
  play: async (context) => {
    await play(context);
    await testDialogA11y(context, {triggerLabel: 'Sort & Filter'});
  },
};
