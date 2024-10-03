import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-facet-manager',
  title: 'Atomic/FacetManager',
  id: 'atomic-facet-manager',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    default: {
      control: false,
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-facet-manager',
  decorators: [
    (story) => html`
      <style>
        atomic-facet-manager {
          width: 500px;
          margin: auto;
          display: block;
        }
      </style>
      ${story()}
    `,
  ],
  args: {
    'slots-default': `
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
    `,
  },
};
