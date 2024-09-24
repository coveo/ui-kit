import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
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
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-sort-expression',
  args: {
    'attributes-label': 'Relevance',
    'attributes-expression': 'relevancy',
  },
};
