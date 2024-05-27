import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';

const {decorator: resultDecorator, engineConfig} = wrapInResult();
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-icon',
  title: 'Atomic/ResultList/ResultLink',
  id: 'atomic-result-link',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
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
