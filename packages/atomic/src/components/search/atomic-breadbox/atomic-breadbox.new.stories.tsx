import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {buildSearchResponseWithResults} from '@/storybook-utils/api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-breadbox/atomic-breadbox.js';
import '@/src/components/search/atomic-facet/atomic-facet.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const mockSearchApi = new MockSearchApi();
mockSearchApi.enableInteractiveFacets();
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
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.clearAll();
  },
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

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test'],
  decorators: [
    (story) => html`
      <atomic-query-summary></atomic-query-summary>
      ${story()}
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
      </div>
    `,
  ],
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(120));
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(42));
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(120));
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const facetValue = await canvas.findByShadowLabelText(
          'Inclusion filter on People',
          {exact: false}
        );
        facetValue.click();

        const breadcrumb = await canvas.findByShadowLabelText(
          /Remove inclusion filter on/,
          {exact: false}
        );
        breadcrumb.click();
      },
      expectedText: 'Results loaded. Results 1-10 of 120',
      timeout: 5000,
    });
  },
};
