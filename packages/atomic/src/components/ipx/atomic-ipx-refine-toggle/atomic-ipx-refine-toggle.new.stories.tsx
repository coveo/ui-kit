import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-ipx-refine-toggle',
  {excludeCategories: ['methods']}
);

async function initializeInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
  await searchInterface!.executeFirstSearch();
}

const meta: Meta = {
  component: 'atomic-ipx-refine-toggle',
  title: 'IPX/IpxRefineToggle',
  id: 'atomic-ipx-refine-toggle',
  render: (args) => html`
    <atomic-search-interface>
      ${template(args)}
      <atomic-ipx-refine-modal>
        <atomic-facet field="author" label="Author"></atomic-facet>
        <atomic-facet field="source" label="Source"></atomic-facet>
        <atomic-facet field="filetype" label="File Type"></atomic-facet>
      </atomic-ipx-refine-modal>
    </atomic-search-interface>
  `,
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  play: async (context) => {
    await initializeInterface(context.canvasElement);
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const WithResults: Story = {
  name: 'With search results',
  play: async (context) => {
    await initializeInterface(context.canvasElement);
  },
};

export const WithCollapsedFacets: Story = {
  name: 'With collapsed facets after 2',
  args: {
    'collapse-facets-after': 2,
  },
};

export const WithAllFacetsCollapsed: Story = {
  name: 'With all facets collapsed',
  args: {
    'collapse-facets-after': 0,
  },
};
