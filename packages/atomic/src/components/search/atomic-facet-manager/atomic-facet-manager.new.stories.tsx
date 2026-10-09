import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockSearchApi, type SearchResponse} from '@coveo/platform-mock-api/search';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-facet/atomic-facet.js';
import '@/src/components/search/atomic-facet-manager/atomic-facet-manager.js';
import '@/src/components/search/atomic-popover/atomic-popover.js';

const searchApiHarness = new MockSearchApi();

const facetResponses = {
  author: {
    facetId: 'author',
    field: 'author',
    values: [
      {value: 'Alice Johnson', numberOfResults: 150, state: 'idle'},
      {value: 'Bob Smith', numberOfResults: 120, state: 'idle'},
      {value: 'Carol Williams', numberOfResults: 98, state: 'idle'},
      {value: 'David Brown', numberOfResults: 76, state: 'idle'},
      {value: 'Emma Davis', numberOfResults: 54, state: 'idle'},
    ],
    moreValuesAvailable: true,
  },
  language: {
    facetId: 'language',
    field: 'language',
    values: [
      {value: 'English', numberOfResults: 250, state: 'idle'},
      {value: 'Spanish', numberOfResults: 180, state: 'idle'},
      {value: 'French', numberOfResults: 145, state: 'idle'},
      {value: 'German', numberOfResults: 92, state: 'idle'},
    ],
    moreValuesAvailable: true,
  },
  objecttype: {
    facetId: 'objecttype',
    field: 'objecttype',
    values: [
      {value: 'Article', numberOfResults: 320, state: 'idle'},
      {value: 'Blog', numberOfResults: 215, state: 'idle'},
      {value: 'Video', numberOfResults: 167, state: 'idle'},
      {value: 'PDF', numberOfResults: 134, state: 'idle'},
    ],
    moreValuesAvailable: true,
  },
  year: {
    facetId: 'year',
    field: 'year',
    values: [
      {value: '2024', numberOfResults: 420, state: 'idle'},
      {value: '2023', numberOfResults: 385, state: 'idle'},
      {value: '2022', numberOfResults: 298, state: 'idle'},
      {value: '2021', numberOfResults: 221, state: 'idle'},
    ],
    moreValuesAvailable: true,
  },
} satisfies Record<string, SearchResponse['facets'][number]>;

/**
 * The Search API returns the facets in the order decided by the Dynamic Navigation Experience (DNE),
 * which is the order the facet manager applies to its children.
 */
const mockFacetsInOrder = (...fields: (keyof typeof facetResponses)[]) =>
  searchApiHarness.searchEndpoint.mockOnce((response) => ({
    ...response,
    facets: fields.map((field) => facetResponses[field]),
  }));

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-facet-manager', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-facet-manager',
  title: 'Search/Facet Manager',
  id: 'atomic-facet-manager',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
  globals: {
    default: {
      control: false,
    },
  },
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) => html`
      <style>
        atomic-facet-manager {
          width: 500px;
          margin: auto;
          display: block;
        }
      </style>
      ${story()}
    `,
  ],
  args: {
    'default-slot': `
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
    `,
  },
  beforeEach: async () => {
    mockFacetsInOrder('author', 'language', 'objecttype', 'year');
  },
};

export const WithPopovers: Story = {
  name: 'With facets inside atomic-popover',
  decorators: [
    (story) => html`
      <style>
        atomic-facet-manager {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: auto;
          width: 800px;
        }
      </style>
      ${story()}
    `,
  ],
  args: {
    'default-slot': `
      <atomic-popover>
        <atomic-facet field="author" label="Authors"></atomic-facet>
      </atomic-popover>
      <atomic-popover>
        <atomic-facet field="language" label="Language"></atomic-facet>
      </atomic-popover>
      <atomic-popover>
        <atomic-facet
          field="objecttype"
          label="Type"
          display-values-as="link"
        ></atomic-facet>
      </atomic-popover>
      <atomic-popover>
        <atomic-facet
          field="year"
          label="Year"
          display-values-as="box"
        ></atomic-facet>
      </atomic-popover>
    `,
  },
  beforeEach: async () => {
    mockFacetsInOrder('year', 'objecttype', 'language', 'author');
    // The order changes again in the next response, as it does when the query or the selected values change.
    mockFacetsInOrder('language', 'year', 'author', 'objecttype');
  },
};
