import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {commerceFacetWidthDecorator} from '@/storybook-utils/commerce/commerce-facet-width-decorator';
import {
  hideFacetTypesHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {play, decorator} = wrapInCommerceInterface({
  includeCodeRoot: false,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-numeric-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-numeric-facet',
  title: 'Commerce/Facet (Numeric)',
  id: 'atomic-commerce-numeric-facet',
  render: (args) => template(args),
  decorators: [commerceFacetWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
};

export default meta;

export const Default: Story = {
  decorators: [
    (_) => {
      return html`<div id="code-root">
        <atomic-commerce-facets></atomic-commerce-facets>
      </div>`;
    },
  ],
  play: async (context) => {
    await play(context);
    await hideFacetTypesHook('atomic-commerce-numeric-facet', context);
  },
};
