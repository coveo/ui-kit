import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-numeric-range',
  title: 'Atomic/NumericFacet/Range',
  id: 'atomic-numeric-range',

  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-numeric-range',
  args: {start: 0, end: 1000},
  decorators: [
    (story) => html`  
        <atomic-numeric-facet
          field="ytviewcount"
        >
        ${story()}
        </atomic-facet>
    `,
  ],
};
