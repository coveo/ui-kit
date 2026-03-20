import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-facet/atomic-facet.js';
import '@/src/components/ipx/atomic-ipx-modal/atomic-ipx-modal.js';
import '@/src/components/ipx/atomic-ipx-refine-toggle/atomic-ipx-refine-toggle.js';
import '@/src/components/common/atomic-layout-section/atomic-layout-section.js';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-refine-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-ipx-refine-toggle',
  title: 'Reference/IPX/Refine Toggle',
  id: 'atomic-ipx-refine-toggle',
  render: (args) => html`
    <style>
      atomic-ipx-modal {
        position: relative;
        inset: auto;
      }
    </style>
    <atomic-ipx-modal is-open>
      <div slot="header" style="padding-bottom: 0.875rem;">
        <atomic-layout-section section="search">
          ${template(args)}
        </atomic-layout-section>
      </div>
      <atomic-layout-section section="facets">
        <atomic-facet field="author" label="Author"></atomic-facet>
        <atomic-facet field="source" label="Source"></atomic-facet>
        <atomic-facet field="filetype" label="File Type"></atomic-facet>
      </atomic-layout-section>
      <div slot="body"></div>
      <div slot="footer"></div>
    </atomic-ipx-modal>
  `,
  decorators: [decorator],
  parameters: {
    ...parameters,
    layout: 'centered',
    actions: {
      handles: events,
    },
    docs: {
      ...parameters.docs,
      story: {
        ...parameters.docs?.story,
      },
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const WithCollapsedFacets: Story = {
  name: 'With collapsed facets after 1',
  args: {
    'collapse-facets-after': 1,
  },
};
