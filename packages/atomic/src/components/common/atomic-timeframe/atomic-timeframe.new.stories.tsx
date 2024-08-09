import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-timeframe',
  title: 'Atomic/TimeframeFacet/Timeframe',
  id: 'atomic-timeframe',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-timeframe',
  args: {'attributes-unit': 'year'},
  decorators: [
    (story) => html`
      <atomic-timeframe-facet field="date"> ${story()} </atomic-timeframe-facet>
    `,
  ],
};
