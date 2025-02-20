import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-facet',
  title: 'Atomic/Facet',
  id: 'atomic-facet',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    'attributes-number-of-values': {
      name: 'number-of-values',
      control: {type: 'number', min: 1},
    },
    'attributes-sort-criteria': {
      name: 'sort-criteria',
      type: 'string',
    },
  },
  args: {
    'attributes-number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-facet',
  args: {
    'attributes-field': 'objecttype',
  },
  decorators: [facetDecorator],
};

export const LowFacetValues: Story = {
  tags: ['test'],
  args: {
    'attributes-field': 'objecttype',
    'attributes-number-of-values': 2,
  },
  decorators: [facetDecorator],
};

export const monthFacet: Story = {
  tags: ['test'],
  args: {
    'attributes-field': 'month',
    'attributes-label': 'Month',
    'attributes-number-of-values': 2,
  },
  decorators: [facetDecorator],
};

export const CustomSort: Story = {
  tags: ['test'],
  args: {
    'attributes-field': 'cat_available_sizes',
    'attributes-custom-sort': '["XL", "L", "M", "S"]',
    'attributes-sort-criteria': 'alphanumeric',
    'attributes-number-of-values': 4,
  },
  decorators: [
    facetDecorator,
    (_Story, context) => {
      console.log(context);
      return html`<atomic-facet
        field=${context.args['attributes-field']}
        custom-sort=${context.args['attributes-custom-sort']}
        sort-criteria=${context.args['attributes-sort-criteria']}
        number-of-values=${context.args['attributes-number-of-values']}
      ></atomic-facet>`;
    },
  ],
};
