import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-search-box-instant-results',
  {imageSize: 'small'},
  {
    engineConfig: {
      accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
      organizationId: 'fashioncoveodemocomgzh7iep8',
      search: {
        searchHub: 'MainSearch',
      },
    },
    additionalChildMarkup: () => {
      return html`<atomic-result-template>
        <template>
          <style>
            div.result-root.with-sections.display-list.image-small
              atomic-result-section-visual {
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
            <atomic-result-image
              field="ec_images"
              aria-hidden="true"
            ></atomic-result-image>
          </atomic-result-section-visual>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-title-metadata>
            <div class="rating-wrapper">
              <atomic-result-rating field="ec_rating"></atomic-result-rating>
              <atomic-field-condition class="field" if-defined="ec_rating">
                <span>
                  <atomic-result-number
                    field="cat_rating_count"
                  ></atomic-result-number>
                </span>
              </atomic-field-condition>
            </div>
          </atomic-result-section-title-metadata>
          <atomic-result-section-bottom-metadata>
            <atomic-result-number field="ec_price">
              <atomic-format-currency currency="USD"></atomic-format-currency>
            </atomic-result-number>
          </atomic-result-section-bottom-metadata>
        </template>
      </atomic-result-template>`;
    },
    parentElement: function () {
      const parent = document.createElement('atomic-search-box');
      const suggestions = document.createElement(
        'atomic-search-box-query-suggestions'
      );
      parent.appendChild(suggestions);
      return parent;
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/SearchBox/InstantResults',
  id: 'atomic-search-box-instant-results',
};

export const Default = exportedStory;
