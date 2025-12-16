import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-refine-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-refine-toggle',
  title: 'Search/RefineToggle',
  id: 'atomic-refine-toggle',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) => html`
      ${story()}
      <div style="display:none;">
        <atomic-facet field="author" label="Authors"></atomic-facet>
        <atomic-facet field="language" label="Language"></atomic-facet>
        <atomic-facet
          field="objecttype"
          label="Type"
          display-values-as="link"
        ></atomic-facet>
        <atomic-facet
          field="year"
          label="Year"
          display-values-as="box"
        ></atomic-facet>
      </div>
    `,
    decorator,
  ],
};

export const WithAtomicExternals: Story = {
  name: 'With multiple atomic-external',
  decorators: [
    (story) => html`
      <atomic-search-interface id="foo">
        <h1>Search Interface</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet2"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet1"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet7"></atomic-facet>
      </atomic-search-interface>
      <atomic-external selector="#foo">
        <h1>External 1</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet4"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet3"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet8"></atomic-facet>
      </atomic-external>
 
      <atomic-external selector="#foo">
        <h1>External 3</h1>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet6"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet5"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet9"></atomic-facet>
      </atomic-external>
      <atomic-external selector="#foo">
        <h1>External 4</h1>
        ${story()}
      </atomic-external>
    `,
  ],
};
