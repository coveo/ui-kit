import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-component-error',
  title: 'Common/Component Error',
  id: 'atomic-component-error',

  render: (args) => {
    const element = document.createElement('atomic-component-error');
    element.error = args['attributes-error'];
    element.element = args['attributes-element'];
    return element;
  },
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-component-error',
  args: {
    'attributes-error': new Error('This is an error'),
    'attributes-element': document.createElement('some-element'),
  },
  decorators: [(story) => html` ${story()}`],
  play: async (context) => {
    await play(context);
  },
};
