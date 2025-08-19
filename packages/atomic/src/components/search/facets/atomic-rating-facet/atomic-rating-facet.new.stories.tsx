import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-rating-facet',
  title: 'Search/RatingFacet',
  id: 'atomic-rating-facet',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    'attributes-number-of-values': {
      name: 'number-of-values',
      control: {type: 'number', min: 1},
    },
  },
  args: {
    'attributes-number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-rating-facet',
  args: {
    'attributes-field': 'snrating',
  },
  decorators: [facetDecorator],
};

export const DisplayAsLink: Story = {
  name: 'atomic-rating-facet',
  tags: ['test'],
  args: {
    'attributes-display-values-as': 'link',
    'attributes-field': 'snrating',
  },
  decorators: [facetDecorator],
};
