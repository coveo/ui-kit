import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-rating-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-rating-facet',
  title: 'Search/RatingFacet',
  id: 'atomic-rating-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes: {
    ...argTypes,
    'tabs-included': {
      control: {type: 'object'},
    },
    'tabs-excluded': {
      control: {type: 'object'},
    },
    'depends-on': {
      control: {type: 'object'},
    },
    'allowed-values': {
      control: {type: 'object'},
    },
  },

  play,
  args: {
    ...args,
    'number-of-values': 8,
    'tabs-included': '[]',
    'tabs-excluded': '[]',
    'allowed-values': '[]',
    'depends-on': '{}',
  },
};

export default meta;

export const Default: Story = {
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const DisplayAsLink: Story = {
  name: 'With display as link',
  tags: ['test'],
  args: {
    'display-values-as': 'link',
    field: 'snrating',
  },
  decorators: [facetDecorator],
};
