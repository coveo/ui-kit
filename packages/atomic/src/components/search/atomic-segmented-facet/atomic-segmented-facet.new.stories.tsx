import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {buildSearchResponseWithResults} from '@/storybook-utils/api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-segmented-facet/atomic-segmented-facet.js';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-segmented-facet',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-segmented-facet',
  title: 'Search/SegmentedFacet',
  id: 'atomic-segmented-facet',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  argTypes: {
    ...argTypes,
  },
  beforeEach: () => {
    searchApiHarness.clearAll();
  },
  play,
  args: {
    ...args,
    'tabs-included': '[]',
    'tabs-excluded': '[]',
    'allowed-values': '[]',
    'custom-sort': '[]',
    'depends-on': '{}',
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-segmented-facet',
  args: {
    field: 'objecttype',
    label: 'Object Type',
  },
  decorators: [
    (story) => html`
      <style>
        atomic-segmented-facet {
          width: 800px;
          margin: auto;
          display: block;
        }
      </style>
      ${story()}
    `,
  ],
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test'],
  args: {
    field: 'objecttype',
    label: 'Object Type',
  },
  decorators: [
    (story) => html`
      <atomic-query-summary></atomic-query-summary>
      <style>
        atomic-segmented-facet {
          width: 800px;
          margin: auto;
          display: block;
        }
      </style>
      ${story()}
    `,
  ],
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(
      buildSearchResponseWithResults(120)
    );
    searchApiHarness.searchEndpoint.mockOnce(
      buildSearchResponseWithResults(42)
    );
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const button = await canvas.findByShadowRole('button', {
          name: /People/,
        });
        button.click();
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};
