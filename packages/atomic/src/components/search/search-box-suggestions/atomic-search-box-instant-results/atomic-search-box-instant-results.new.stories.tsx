import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface({
  accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
  organizationId: 'fashioncoveodemocomgzh7iep8',
  search: {
    searchHub: 'MainSearch',
  },
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box-instant-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-search-box-instant-results',
  title: 'Search/SearchBox/InstantResults',
  id: 'atomic-search-box-instant-results',
  render: (args) => template(args),
  decorators: [
    (story) =>
      html`<atomic-search-box>
        <atomic-search-box-query-suggestions>
          ${story()}
        </atomic-search-box-query-suggestions>
      </atomic-search-box>`,
    decorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-instant-results',
  args: {
    'default-slot': `
      <atomic-result-template>
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
      </atomic-result-template>
    `,
    imageSize: 'small',
  },
  decorators: [
    (story) => html`
      <style>
        atomic-search-box::part(suggestions-left) {
          display: none;
        }
      </style>
      ${story()}
    `,
  ],
  play: async (context) => {
    await play(context);
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);
    await step('Click Searchbox', async () => {
      (
        await canvas.findAllByShadowTitle('Search field with suggestions.', {
          exact: false,
        })
      )
        ?.find((el) => el.getAttribute('part') === 'textarea')
        ?.focus();
    });
  },
};
