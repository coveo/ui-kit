import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-facet-manager',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-facet-manager',
  title: 'Search/FacetManager',
  id: 'atomic-facet-manager',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
  globals: {
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
    'default-slot': `
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
