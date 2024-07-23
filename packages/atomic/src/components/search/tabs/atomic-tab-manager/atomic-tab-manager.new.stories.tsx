import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-tab-manager',
  title: 'Atomic/Tabs',
  id: 'atomic-tab-manager',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  args: {
    'slots-default': `
      <atomic-tab name="all" label="All" tab></atomic-tab>
      <atomic-tab name="article" label="Articles"></atomic-tab>
      <atomic-tab name="documentation" label="Documentation"></atomic-tab>
    `,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-tab-manager',
  decorators: [
    (story) => html`
      ${story()}
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
        <atomic-facet
          data-testid="included-facet"
          tabs-included='["article"]'
          field="filetype"
          style="flex-grow:1"
          label="File type"
        ></atomic-facet>
        <atomic-facet
          data-testid="excluded-facet"
          tabs-excluded='["article"]'
          field="source"
          style="flex-grow:1"
          label="Source"
        ></atomic-facet>
      </div>
    `,
  ],
};
