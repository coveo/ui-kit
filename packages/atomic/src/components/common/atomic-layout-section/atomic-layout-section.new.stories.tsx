import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-layout-section',
  title: 'Common/Layout Section',
  id: 'atomic-layout-section',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-layout-section',
  args: {
    'slots-default': `<span>Section content</span>`,
  },
};
