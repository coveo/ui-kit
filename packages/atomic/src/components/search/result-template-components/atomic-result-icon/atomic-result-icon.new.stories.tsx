import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';

const {decorator, play} = wrapInResult();

const meta: Meta = {
  component: 'atomic-result-icon',
  title: 'Atomic/ResultList/ResultIcon',
  id: 'atomic-result-icon',

  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'atomic-result-icon',
};
