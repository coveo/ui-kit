import {wrapInRecommendationInterface} from '@coveo/atomic/storybookUtils/recs-interface-wrapper';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

const {decorator, play} = wrapInRecommendationInterface();

const meta: Meta = {
  component: 'atomic-recs-list',
  title: 'Atomic/RecsList',
  id: 'atomic-recs-list',

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
