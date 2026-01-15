import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-search-box',
  {excludeCategories: ['methods']}
);
const {decorator, play} = wrapInInsightInterface({}, true);

const mockInsightApi = new MockInsightApi();

const normalWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 400px;" id="code-root">${story()}</div>`;

const meta: Meta = {
  component: 'atomic-insight-search-box',
  title: 'Insight/Search Box',
  id: 'atomic-insight-search-box',
  render: (args) => template(args),
  decorators: [normalWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const WithDisabledSearch: Story = {
  name: 'With disabled search',
  args: {
    'disable-search': true,
  },
};
