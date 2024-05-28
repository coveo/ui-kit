import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-sort-expression',
  title: 'Atomic/SortExpression',
  id: 'atomic-sort-expression',

  render: renderComponent,
  decorators: [
    (story) => html`
      <atomic-sort-dropdown> ${story()} </atomic-sort-dropdown>
    `,
    decorator,
  ],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-sort-expression',
  args: {
    label: 'Relevance',
    expression: 'relevancy',
  },
};
