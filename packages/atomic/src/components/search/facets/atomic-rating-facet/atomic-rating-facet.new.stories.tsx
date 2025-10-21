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
  argTypes,

  play,
  args: {
    ...args,
    'number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-rating-facet',
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const DisplayAsLink: Story = {
  name: 'atomic-rating-facet',
  tags: ['test'],
  args: {
    'display-values-as': 'link',
    field: 'snrating',
  },
  decorators: [facetDecorator],
};
