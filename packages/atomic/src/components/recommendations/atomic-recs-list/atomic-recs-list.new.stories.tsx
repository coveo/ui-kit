import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInRecommendationInterface} from '@coveo/atomic/storybookUtils/search/recs-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

const {decorator, play} = wrapInRecommendationInterface();

const meta: Meta = {
  component: 'atomic-recs-list',
  title: 'Atomic/RecsList',
  id: 'atomic-recs-list',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-recs-list',
  decorators: [
    (story) =>
      html` <style>
          atomic-recs-list {
            margin: 24px;
          }
        </style>
        ${story()}`,
  ],
};
