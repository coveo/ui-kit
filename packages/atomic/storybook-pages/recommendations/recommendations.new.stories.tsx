import {getSampleRecommendationEngineConfiguration} from '@coveo/headless/recommendation';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockRecommendationApi} from '@/storybook-utils/api/recommendation/mock.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeRecsInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-recs-interface');
  const recsInterface = canvasElement.querySelector('atomic-recs-interface');
  await recsInterface!.initialize({
    ...getSampleRecommendationEngineConfiguration(),
  });
}

const mockRecommendationApi = new MockRecommendationApi();

const meta: Meta = {
  component: 'recs-page',
  title: 'Recommendations/Example Pages',
  id: 'recs-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockRecommendationApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  render: () => html`
    <style>
      .recs-layout {
        padding: 20px;
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 30px;
      }

      .recs-tiles {
        --atomic-recs-number-of-columns: 4;
      }

      .recs-list {
        --atomic-recs-number-of-columns: 1;
      }

      .recs-carousel {
        grid-column: 1 / span 2;
        --atomic-recs-number-of-columns: 3;
      }

      .rating-wrapper {
        display: flex;
        align-items: center;
      }

      .rating-wrapper span {
        margin-left: 5px;
        color: #6c757d;
      }

      atomic-recs-list::part(label) {
        font-size: var(--atomic-text-xl);
        padding-top: 0.75rem;
        padding-bottom: 0.5rem;
      }

      @media only screen and (max-width: 1280px) {
        .recs-layout {
          grid-template-columns: 1fr 1fr;
        }

        .recs-tiles {
          --atomic-recs-number-of-columns: 2;
        }
      }

      @media only screen and (max-width: 720px) {
        .recs-layout {
          grid-template-columns: 1fr;
        }

        .recs-carousel {
          grid-column: 1;
        }
      }
    </style>
    <div class="recs-layout">
      <!-- Grid/Tiles Layout -->
      <atomic-recs-interface
        class="recs-tiles"
        fields-to-include='["cat_rating_count"]'
        language-assets-path="./lang"
        icon-assets-path="./assets"
      >
        <atomic-recs-list label="Top clothing for you" display="grid" number-of-recommendations="8">
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
                  color: #6c757d;
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
                    <span><atomic-result-number field="cat_rating_count"></atomic-result-number> reviews</span>
                  </atomic-field-condition>
                </div>
              </atomic-result-section-title-metadata>
              <atomic-result-section-emphasized>
                <atomic-result-number field="ec_price">
                  <atomic-format-currency currency="USD"></atomic-format-currency>
                </atomic-result-number>
              </atomic-result-section-emphasized>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>
      </atomic-recs-interface>

      <!-- List Layout -->
      <atomic-recs-interface
        class="recs-list"
        fields-to-include='["cat_rating_count"]'
        language-assets-path="./lang"
        icon-assets-path="./assets"
      >
        <atomic-recs-list label="Frequently viewed" recommendation="frequentViewed" number-of-recommendations="4">
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
                  color: #6c757d;
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
                    <span><atomic-result-number field="cat_rating_count"></atomic-result-number> reviews</span>
                  </atomic-field-condition>
                </div>
              </atomic-result-section-title-metadata>
              <atomic-result-section-emphasized>
                <atomic-result-number field="ec_price">
                  <atomic-format-currency currency="USD"></atomic-format-currency>
                </atomic-result-number>
              </atomic-result-section-emphasized>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>
        <atomic-recs-error></atomic-recs-error>
      </atomic-recs-interface>

      <!-- Carousel Layout -->
      <atomic-recs-interface
        class="recs-carousel"
        fields-to-include='["cat_rating_count"]'
        language-assets-path="./lang"
        icon-assets-path="./assets"
      >
        <atomic-recs-list
          label="You may also like"
          display="carousel"
          number-of-recommendations="9"
        >
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
                  color: #6c757d;
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
                    <span><atomic-result-number field="cat_rating_count"></atomic-result-number> reviews</span>
                  </atomic-field-condition>
                </div>
              </atomic-result-section-title-metadata>
              <atomic-result-section-emphasized>
                <atomic-result-number field="ec_price">
                  <atomic-format-currency currency="USD"></atomic-format-currency>
                </atomic-result-number>
              </atomic-result-section-emphasized>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>
        <atomic-recs-error></atomic-recs-error>
      </atomic-recs-interface>
    </div>
  `,
  play: async (context) => {
    const recsInterfaces = context.canvasElement.querySelectorAll(
      'atomic-recs-interface'
    );

    await Promise.all(
      Array.from(recsInterfaces).map(async (recsInterface) => {
        await initializeRecsInterface(
          recsInterface.parentElement as HTMLElement
        );
      })
    );

    await Promise.all(
      Array.from(recsInterfaces).map(async (recsInterface) => {
        await recsInterface.getRecommendations();
      })
    );
  },
};

export default meta;

export const Default: Story = {
  name: 'Recommendations Page',
};
