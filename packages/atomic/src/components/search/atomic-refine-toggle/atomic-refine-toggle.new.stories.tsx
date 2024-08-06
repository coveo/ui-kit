import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-refine-toggle',
  title: 'Atomic/RefineToggle',
  id: 'atomic-refine-toggle',
  render: renderComponent,
  decorators: [decorator],
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
  ],
};
