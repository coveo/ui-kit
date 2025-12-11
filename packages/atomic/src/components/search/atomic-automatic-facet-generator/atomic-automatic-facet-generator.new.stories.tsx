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

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const facetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px;">${story()}</div>`;
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-automatic-facet-generator',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-automatic-facet-generator',
  title: 'Search/AutomaticFacetGenerator',
  id: 'atomic-automatic-facet-generator',
  render: (args) => template(args),
  decorators: [facetWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  argTypes,
  args,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {};
