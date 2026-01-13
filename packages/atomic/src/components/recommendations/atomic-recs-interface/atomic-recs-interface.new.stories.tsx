import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {MockRecommendationApi} from '@/storybook-utils/api/recommendation/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInRecommendationInterface} from '@/storybook-utils/search/recs-interface-wrapper';

const mockRecommendationApi = new MockRecommendationApi();
const {decorator, play} = wrapInRecommendationInterface();

const {events, args, argTypes} = getStorybookHelpers('atomic-recs-interface', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-recs-interface',
  title: 'Recommendations/Interface',
  id: 'atomic-recs-interface',
  render: (args) => html`${unsafeHTML(args['default-slot'] || '')}`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockRecommendationApi.handlers],
    },
    actions: {
      handles: events,
    },
  },
  argTypes: {
    ...argTypes,
    engine: {
      ...argTypes,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    i18n: {
      ...argTypes.i18n,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
  },
  args: {
    ...args,
    engine: undefined,
    i18n: undefined,
    language: 'en',
    'default-slot': `<span>Interface content</span>`,
  },
};

export default meta;

export const Default: Story = {
  play,
};

const {play: playNoFirstQuery} = wrapInRecommendationInterface({
  skipFirstQuery: true,
});

export const RecsBeforeInit: Story = {
  tags: ['!dev'],
  play: playNoFirstQuery,
};

export const WithRecsList: Story = {
  args: {
    'default-slot': `<atomic-recs-list label="Recommended articles" display="list" density="normal" image-size="small" number-of-recommendations="10">
          <atomic-recs-result-template>
            <template>
              <atomic-result-section-visual>
                <atomic-result-image field="image" aria-hidden="true"></atomic-result-image>
              </atomic-result-section-visual>
              <atomic-result-section-badges>
                <atomic-result-badge field="category"></atomic-result-badge>
              </atomic-result-section-badges>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <atomic-result-fields-list>
                  <atomic-field-condition class="field" if-defined="author">
                    <span class="field-label">
                      <atomic-text value="author"></atomic-text>:
                    </span>
                    <atomic-result-text field="author"></atomic-result-text>
                  </atomic-field-condition>
                  <atomic-field-condition class="field" if-defined="date">
                    <span class="field-label">
                      <atomic-text value="date"></atomic-text>:
                    </span>
                    <atomic-result-date></atomic-result-date>
                  </atomic-field-condition>
                </atomic-result-fields-list>
              </atomic-result-section-bottom-metadata>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>`,
  },
  play,
};
