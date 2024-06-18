import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {CommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInCommerceInterface({
  skipFirstSearch: true,
});

// TODO: simplify by creating a requestProcessor
const noResultsEngineConfig: Partial<CommerceEngineConfiguration> = {
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.query = 'NOT @URI';
    r.body = JSON.stringify(parsed);
    return r;
  },
};

const fixedNumberOfResults = (
  perPage: number
): Partial<CommerceEngineConfiguration> => ({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.perPage = perPage;
    r.body = JSON.stringify(parsed);
    return r;
  },
});

const {play: playNoresults} = wrapInCommerceInterface({
  skipFirstSearch: false,
  engineConfig: noResultsEngineConfig,
});

const {play: playFixedNumberOfResults} = wrapInCommerceInterface({
  skipFirstSearch: false,
  engineConfig: fixedNumberOfResults(27),
});

const meta: Meta = {
  component: 'atomic-commerce-query-summary',
  title: 'Atomic-Commerce/QuerySummary',
  id: 'atomic-commerce-query-summary',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-query-summary',
};

export const NoResults: Story = {
  name: 'No Results',
  tags: ['test'],
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoresults(context);
  },
};

export const FixedNumberOfResults: Story = {
  name: 'Fixed Number of Results',
  tags: ['test'],
  decorators: [(story) => story()],
  play: async (context) => {
    await playFixedNumberOfResults(context);
  },
};

export const WithSearchBox: Story = {
  name: 'With a Search Box',
  tags: ['test'],
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>

        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
  play: async (context) => {
    await play(context);
  },
};
