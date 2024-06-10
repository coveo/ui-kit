import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-pager',
  title: 'Atomic-Commerce/Pager',
  id: 'atomic-commerce-pager',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'Default',
  decorators: [
    (story) =>
      html`<atomic-layout-section section="pagination">
        ${story()}
      </atomic-layout-section>`,
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};
