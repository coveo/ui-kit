import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {searchFacetTransformer} from '@/storybook-utils/api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-results-per-page/atomic-results-per-page.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-results-per-page',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-results-per-page',
  title: 'Search/Results Per Page',
  id: 'atomic-results-per-page',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    msw: {handlers: [...searchApiHarness.handlers]},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};
