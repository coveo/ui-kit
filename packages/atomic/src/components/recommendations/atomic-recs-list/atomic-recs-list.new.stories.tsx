import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInRecommendationInterface} from '@/storybook-utils/search/recs-interface-wrapper';

const mockedSearchApi = new MockSearchApi();

mockedSearchApi.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 30),
  totalCount: 30,
  totalCountFiltered: 30,
}));

const {decorator, play} = wrapInRecommendationInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-recs-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-recs-list',
  title: 'Recommendations/RecsList',
  id: 'atomic-recs-list',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockedSearchApi.handlers],
    },
  },
  beforeEach: () => {
    mockedSearchApi.searchEndpoint.clear();
  },
  args,
  argTypes,
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
  play,
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
    'default-slot': `<atomic-recs-result-template>
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
  play,
};

export const RecsOpeningInNewTab: Story = {
  tags: ['test'],
  args: {
    'default-slot': `<atomic-recs-result-template>
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
  play,
};

export const RecsAsCarousel: Story = {
  args: {
    'number-of-recommendations-per-page': 4,
  },
  play,
};

export const NotEnoughRecsForCarousel: Story = {
  name: 'Not enough recommendations for carousel',
  beforeEach: () => {
    mockedSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 3),
      totalCount: 3,
      totalCountFiltered: 3,
    }));
  },
  play,
};

export const NoRecommendations: Story = {
  name: 'No recommendations',
  beforeEach: async () => {
    mockedSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      totalCount: 0,
      totalCountFiltered: 0,
      results: [],
    }));
  },
  play,
};
