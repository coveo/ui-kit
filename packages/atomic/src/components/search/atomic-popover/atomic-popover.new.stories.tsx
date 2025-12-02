import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  facets: [
    {
      facetId: 'objecttype',
      field: 'objecttype',
      values: [
        {value: 'Article', numberOfResults: 45, state: 'idle'},
        {value: 'Documentation', numberOfResults: 32, state: 'idle'},
        {value: 'Video', numberOfResults: 28, state: 'idle'},
        {value: 'Tutorial', numberOfResults: 15, state: 'idle'},
      ],
    },
  ],
  categoryFacets: [
    {
      facetId: 'geographicalhierarchy',
      field: 'geographicalhierarchy',
      values: [
        {
          value: 'North America',
          path: ['North America'],
          numberOfResults: 55,
          state: 'idle',
          children: [
            {
              value: 'United States',
              path: ['North America', 'United States'],
              numberOfResults: 40,
              state: 'idle',
            },
            {
              value: 'Canada',
              path: ['North America', 'Canada'],
              numberOfResults: 15,
              state: 'idle',
            },
          ],
        },
        {
          value: 'Europe',
          path: ['Europe'],
          numberOfResults: 45,
          state: 'idle',
        },
      ],
    },
  ],
}));

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-popover',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-popover',
  title: 'Search/Popover',
  id: 'atomic-popover',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
    layout: 'centered',
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  name: 'Default',
  args: {
    'default-slot': `
      <atomic-facet
        field="objecttype"
        label="Object type"
      ></atomic-facet>`,
  },
};
