import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-segmented-facet',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-segmented-facet',
  title: 'Search/SegmentedFacet',
  id: 'atomic-segmented-facet',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  argTypes: {
    ...argTypes,
  },
  play,
  args: {
    ...args,
    'tabs-included': '[]',
    'tabs-excluded': '[]',
    'allowed-values': '[]',
    'custom-sort': '[]',
    'depends-on': '{}',
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-segmented-facet',
  args: {
    field: 'objecttype',
    label: 'Object Type',
  },
  decorators: [
    facetDecorator,
    (story) => html`
      <div style="display: flex; justify-content: center;">
        ${story()}
      </div>
    `,
  ],
};
