import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box',
  {excludeCategories: ['methods']}
);
const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: true,
  includeCodeRoot: false,
});

const searchApiHarness = new MockSearchApi();

const normalWidthDecorator: Decorator = (story) =>
  html` <div style="min-width: 600px;" id="code-root">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Search/Search Box',
  id: 'atomic-search-box',
  render: (args) => template(args),
  decorators: [normalWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args: {
    ...args,
    'minimum-query-length': '0',
  },
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const RichSearchBox: Story = {
  name: 'With suggestions, recent queries and instant results',
  args: {
    'default-slot': ` <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      <atomic-search-box-instant-results
        image-size="small"
      ></atomic-search-box-instant-results>`,
  },
};

export const StandaloneSearchBox: Story = {
  name: 'As a standalone search box',
  args: {
    'redirection-url':
      './iframe.html?id=atomic-search-interface--with-result-list',
  },
};
