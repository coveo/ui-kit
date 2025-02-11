import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInRecommendationInterface} from '@/storybook-utils/search/recs-interface-wrapper';
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

const {play: playNoFirstQuery} = wrapInRecommendationInterface({
  skipFirstQuery: true,
});

export const RecsBeforeQuery: Story = {
  tags: ['test'],
  play: playNoFirstQuery,
};

export const RecsWithFullTemplate: Story = {
  tags: ['test'],
  args: {
    'slots-default': `<atomic-recs-result-template>
            <template>
              <atomic-result-section-visual>
                <span>Visual Section</span>
              </atomic-result-section-visual>
              <atomic-result-section-badge>
                <span>Badge Section</span>
              </atomic-result-section-badge>
              <atomic-result-section-actions>
                <span>Actions Section</span>
              </atomic-result-section-actions>
              <atomic-result-section-title>
                <span>Title Section</span>
              </atomic-result-section-title>
              <atomic-result-section-title-metadata>
                  <span>Title Metadata Section</span>
              </atomic-result-section-title-metadata>
              <atomic-result-section-emphasized>
                <span>Emphasized Section</span>
              </atomic-result-section-emphasized>
              <atomic-result-section-excerpt>
                <span>Excerpt Section</span>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <span>Bottom Metadata Section</span>
              </atomic-result-section-bottom-metadata>
            </template>
          </atomic-recs-result-template>`,
  },
};

export const RecsOpeningInNewTab: Story = {
  tags: ['test'],
  args: {
    'slots-default': `<atomic-recs-result-template>
            <template slot="link">
              <atomic-result-link>
                <a slot="attributes" target="_blank"></a>
              </atomic-result-link>
            </template>
            <template>
              <atomic-result-section-title>
                <atomic-result-text field="title"></atomic-result-text>
              </atomic-result-section-title>
            </template>
          </atomic-recs-result-template>`,
  },
};

export const RecsAsCarousel: Story = {
  args: {
    'attributes-number-of-recommendations-per-page': 4,
  },
};
