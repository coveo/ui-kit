import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@coveo/atomic-storybook-utils/common/facets-decorator';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-numeric-facet',
  title: 'Atomic/NumericFacet',
  id: 'atomic-numeric-facet',
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
  name: 'atomic-numeric-facet',
  decorators: [facetDecorator],
  args: {
    'attributes-field': 'ytviewcount',
  },
};
