import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-search-box',
  {excludeCategories: ['methods']}
);
const {decorator, play} = wrapInCommerceInterface({
  skipFirstRequest: true,
  includeCodeRoot: false,
});

const normalWidthDecorator: Decorator = (story) =>
  html` <div style="min-width: 600px;" id="code-root">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-commerce-search-box',
  title: 'Commerce/Search Box',
  id: 'atomic-commerce-search-box',
  render: (args) => template(args),
  decorators: [normalWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'minimum-query-length': '0',
  },
  argTypes,

  afterEach: play,
};

export default meta;

export const Default: Story = {};

export const RichSearchBox: Story = {
  name: 'With suggestions, recent queries and instant products',
  args: {
    'default-slot': ` <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        image-size="small"
      ></atomic-commerce-search-box-instant-products>`,
  },
};

export const StandaloneSearchBox: Story = {
  name: 'As a standalone search box',
  args: {
    redirectionUrl:
      './iframe.html?id=atomic-commerce-search-box--in-page&viewMode=story&args=enable-query-syntax:!true;suggestion-timeout:5000',
  },
};
