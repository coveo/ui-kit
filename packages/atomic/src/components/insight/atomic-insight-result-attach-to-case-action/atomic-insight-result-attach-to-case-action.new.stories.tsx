import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-result-attach-to-case-action',
  title: 'TODO/Insight Result Attach To Case Action',
  id: 'atomic-insight-result-attach-to-case-action',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  afterEach,
};

export default meta;

export const Default: Story = {};
