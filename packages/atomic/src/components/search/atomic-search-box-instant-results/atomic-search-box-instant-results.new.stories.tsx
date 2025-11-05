import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: {
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
    search: {
      searchHub: 'MainSearch',
    },
  },
});

const searchBoxDecorator = (story: () => unknown) =>
  html`<atomic-search-box>
    <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
    ${story()}
  </atomic-search-box>`;

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box-instant-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-search-box-instant-results',
  title: 'Search/Search Box Instant Results',
  id: 'atomic-search-box-instant-results',
  render: (args) => template(args),
  decorators: [searchBoxDecorator, searchInterfaceDecorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  tags: ['!test'],
  args,
  argTypes,

  play: async (context) => {
    await play(context);
    const searchBox =
      await context.canvas.findAllByShadowPlaceholderText('Search');
    await userEvent.click(searchBox[0]);
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-search-box-instant-results',
  args: {
    'default-slot': html`
      <atomic-result-template>
        <template>
          <style>
            div.result-root.with-sections.display-list.image-icon
              atomic-result-section-visual {
              height: 60px;
            }
          </style>
          <atomic-result-section-visual>
            <atomic-result-icon></atomic-result-icon>
          </atomic-result-section-visual>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-bottom-metadata>
            <atomic-result-printable-uri></atomic-result-printable-uri>
          </atomic-result-section-bottom-metadata>
        </template>
      </atomic-result-template>
    `,
    imageSize: 'icon',
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
};
