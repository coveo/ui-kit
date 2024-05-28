import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-popover',
  title: 'Atomic/Popover',
  id: 'atomic-popover',

  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-popover',
  args: {
    default: `
      <atomic-facet
        field="objecttype"
        label="Object type"
      ></atomic-facet>`,
  },
};
