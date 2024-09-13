import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {facetDecorator} from '@coveo/atomic/storybookUtils/common/facets-decorator';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-rating-facet',
  title: 'Atomic/RatingFacet',
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
