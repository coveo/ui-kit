import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-timeframe',
  title: 'Atomic/TimeframeFacet/Timeframe',
  id: 'atomic-timeframe',

  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;
type Story = StoryObj;

export const FirstStory: Story = {
  name: 'atomic-timeframe',
  args: {unit: 'year'},
  decorators: [
    (story) => html`
      <atomic-timeframe-facet field="date"> ${story()} </atomic-timeframe-facet>
    `,
  ],
};
