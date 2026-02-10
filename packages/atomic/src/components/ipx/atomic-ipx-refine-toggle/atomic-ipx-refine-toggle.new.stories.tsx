import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-refine-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-ipx-refine-toggle',
  title: 'IPX/Refine Toggle',
  id: 'atomic-ipx-refine-toggle',
  render: (args) => html`
    <div style="display: flex; justify-content: center; padding: 1rem;">
      ${template(args)}
    </div>
    <atomic-ipx-refine-modal>
      <atomic-facet field="author" label="Author"></atomic-facet>
      <atomic-facet field="source" label="Source"></atomic-facet>
      <atomic-facet field="filetype" label="File Type"></atomic-facet>
    </atomic-ipx-refine-modal>
  `,
  decorators: [decorator],
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    actions: {
      handles: events,
    },
    docs: {
      ...parameters.docs,
      story: {
        ...parameters.docs?.story,
        height: '150px',
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
