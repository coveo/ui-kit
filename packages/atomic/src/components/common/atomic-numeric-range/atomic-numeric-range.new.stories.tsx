import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-numeric-range',
  title: 'Atomic/NumericFacet/Range',
  id: 'atomic-numeric-range',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-numeric-range',
  args: {'attributes-start': 0, 'attributes-end': 1000},
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
