import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {facetDecorator} from '@coveo/atomic/storybookUtils/facets-decorator';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-timeframe-facet',
  title: 'Atomic/TimeframeFacet',
  id: 'atomic-timeframe-facet',
  argTypes: {
    'attributes-min': {
      name: 'min',
      type: 'string',
    },
    'attributes-max': {
      name: 'max',
      type: 'string',
    },
  },
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-timeframe-facet',
  decorators: [facetDecorator],
  args: {
    'slots-default': `
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
  `,
  },
};
