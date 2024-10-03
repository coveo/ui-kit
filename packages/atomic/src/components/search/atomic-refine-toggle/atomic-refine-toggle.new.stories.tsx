import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-refine-toggle',
  title: 'Atomic/RefineToggle',
  id: 'atomic-refine-toggle',
  render: renderComponent,
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-refine-toggle',
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
      <atomic-search-interface id="foo" data-testid="root-interface">
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
      <atomic-external selector="#bar">
        <h1>External 2</h1>
        <p>Not bound to the search interface</p>
        <atomic-layout-section section="horizontal-facets">
          <atomic-facet field="author" label="facet01"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet field="author" label="facet02"></atomic-facet>
        </atomic-layout-section>
        <atomic-facet field="author" label="facet03"></atomic-facet>
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
