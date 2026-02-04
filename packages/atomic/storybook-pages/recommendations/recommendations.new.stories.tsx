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
  component: 'content-recs-page',
  title: 'Recommendations/Example Pages',
  id: 'content-recs-page',
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
      .content-recs-layout {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .recs-carousel {
        --atomic-recs-number-of-columns: 5;
      }

      atomic-recs-list::part(label) {
        font-size: var(--atomic-text-2xl);
        font-weight: 600;
        padding-bottom: 1rem;
        color: #2c3e50;
      }

      .content-metadata {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        color: #6c757d;
      }

      .category-badge {
        display: inline-block;
        padding: 4px 12px;
        background-color: #e3f2fd;
        color: #1976d2;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      @media only screen and (max-width: 1600px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 4;
        }
      }

      @media only screen and (max-width: 1280px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 3;
        }
      }

      @media only screen and (max-width: 768px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 2;
        }
      }

      @media only screen and (max-width: 480px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 1;
        }
      }
    </style>
    <div class="content-recs-layout">
      <!-- Recommended Articles Carousel -->
      <atomic-recs-interface
        class="recs-carousel"
        fields-to-include='["author", "date", "category", "source"]'
        language-assets-path="./lang"
        icon-assets-path="./assets"
      >
        <atomic-recs-list
          label="Recommended Articles"
          display="grid"
          number-of-recommendations="10"
          number-of-recommendations-per-page="5"
        >
          <atomic-recs-result-template>
            <template>
              <style>
                div.result-root.with-sections.display-list.image-small atomic-result-section-visual {
                  height: 180px;
                }
                .content-metadata {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 0.875rem;
                  color: #6c757d;
                  flex-wrap: wrap;
                }
                .category-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  background-color: #e3f2fd;
                  color: #145EA9;
                  border-radius: 12px;
                  font-size: 0.75rem;
                  font-weight: 500;
                  text-transform: uppercase;
                }
              </style>
              <atomic-result-section-visual>
                <atomic-result-image field="image" aria-hidden="true"></atomic-result-image>
              </atomic-result-section-visual>
              <atomic-result-section-badges>
                <atomic-field-condition if-defined="category">
                  <span class="category-badge">
                    <atomic-result-text field="category"></atomic-result-text>
                  </span>
                </atomic-field-condition>
              </atomic-result-section-badges>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-title-metadata>
                <div class="content-metadata">
                  <atomic-field-condition if-defined="author">
                    <atomic-result-text field="author"></atomic-result-text>
                  </atomic-field-condition>
                  <atomic-field-condition if-defined="date">
                    <span>•</span>
                    <atomic-format-date format="MMM DD, YYYY">
                      <atomic-result-date field="date"></atomic-result-date>
                    </atomic-format-date>
                  </atomic-field-condition>
                </div>
              </atomic-result-section-title-metadata>
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

export const ContentRecommendations: Story = {
  name: 'Recommendations Page',
};
