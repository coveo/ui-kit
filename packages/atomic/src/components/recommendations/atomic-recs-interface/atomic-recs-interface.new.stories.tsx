import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

async function initializeRecsInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-recs-interface');
  const recsInterface = canvasElement.querySelector('atomic-recs-interface');
  await recsInterface!.initialize({
    accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
    organizationId: 'fashioncoveodemocomgzh7iep8',
  });
}

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-recs-interface',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-recs-interface',
  title: 'Recommendations/Interface',
  id: 'atomic-recs-interface',
  render: (args) => template(args),
  decorators: [(story) => html`<div id="code-root">${story()}</div>`],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  play: async (context) => {
    await initializeRecsInterface(context.canvasElement);
    const recsInterface = context.canvasElement.querySelector(
      'atomic-recs-interface'
    );
    await customElements.whenDefined('atomic-recs-interface');
    await recsInterface!.getRecommendations();
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

export const Default: Story = {};

export const RecsBeforeInit: Story = {
  tags: ['!dev'],
  play: async (context) => {
    const recsInterface = context.canvasElement.querySelector(
      'atomic-recs-interface'
    );
    await customElements.whenDefined('atomic-recs-interface');
    await recsInterface!.getRecommendations();
  },
};

export const WithRecsList: Story = {
  args: {
    'default-slot': `<atomic-recs-list label="Top clothing for you" display="grid" number-of-recommendations="10">
          <atomic-recs-result-template>
            <template>
              <style>
                div.result-root.with-sections.display-list.image-small atomic-result-section-visual {
                  height: 120px;
                }
                .rating-wrapper {
                  display: flex;
                  align-items: center;
                }
                .rating-wrapper span {
                  margin-left: 5px;
                  color: #8e959d;
                }
              </style>
              <atomic-result-section-visual>
                <atomic-result-image field="ec_images" aria-hidden="true"></atomic-result-image>
              </atomic-result-section-visual>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-title-metadata>
                <div class="rating-wrapper">
                  <atomic-result-rating field="ec_rating"></atomic-result-rating>
                  <atomic-field-condition class="field" if-defined="ec_rating">
                    <span> <atomic-result-number field="cat_rating_count"></atomic-result-number> reviews </span>
                  </atomic-field-condition>
                </div>
              </atomic-result-section-title-metadata>
              <atomic-result-section-emphasized>
                <atomic-result-number field="ec_price">
                  <atomic-format-currency currency="USD"></atomic-format-currency>
                </atomic-result-number>
              </atomic-result-section-emphasized>
              <atomic-result-section-excerpt
                ><atomic-result-text field="excerpt"></atomic-result-text
              ></atomic-result-section-excerpt>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>`,
  },
};
