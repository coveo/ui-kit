import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-facet-manager',
  {excludeCategories: ['methods']}
);

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
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
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
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      facets: [
        {
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
        {
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
        {
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
        {
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
      ],
    }));
  },
};
