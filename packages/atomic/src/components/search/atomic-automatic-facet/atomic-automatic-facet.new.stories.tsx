import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {testCheckboxA11y} from '@/storybook-utils/a11y/checkbox.js';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-automatic-facet/atomic-automatic-facet.js';
import '@/src/components/search/atomic-automatic-facet-generator/atomic-automatic-facet-generator.js';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const facetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px;">${story()}</div>`;

const meta: Meta = {
  component: 'atomic-automatic-facet',
  title: 'Search/Automatic Facet',
  id: 'atomic-automatic-facet',
  render: () => html`<atomic-automatic-facet-generator></atomic-automatic-facet-generator>`,
  decorators: [facetWidthDecorator, decorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      generateAutomaticFacets: {
        facets: [
          {
            field: 'objecttype',
            label: 'Type',
            values: [
              {value: 'Document', numberOfResults: 45, state: 'idle'},
              {value: 'PDF', numberOfResults: 32, state: 'idle'},
              {value: 'Video', numberOfResults: 18, state: 'idle'},
              {value: 'Image', numberOfResults: 12, state: 'idle'},
            ],
          },
        ],
      },
    }));
  },
};

export const A11yCheckbox: Story = {
  tags: ['a11y', 'test', '!dev'],
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      generateAutomaticFacets: {
        facets: [
          {
            field: 'objecttype',
            label: 'Type',
            values: [
              {value: 'Document', numberOfResults: 45, state: 'idle'},
              {value: 'PDF', numberOfResults: 32, state: 'idle'},
              {value: 'Video', numberOfResults: 18, state: 'idle'},
              {value: 'Image', numberOfResults: 12, state: 'idle'},
            ],
          },
        ],
      },
    }));
  },
  play: async (context) => {
    await play(context);
    await testCheckboxA11y(context);
  },
};
