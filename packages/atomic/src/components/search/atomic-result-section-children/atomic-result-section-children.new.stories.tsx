import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplateForSections} from '@/storybook-utils/search/result-template-section-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-section-children',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, afterEach} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList(
  'list',
  false,
  'max-width: 100%; width: 768px; padding: 2rem;'
);
const {decorator: resultTemplateDecorator} = wrapInResultTemplateForSections();
const meta: Meta = {
  component: 'atomic-result-section-children',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-children',
  render: (args) => template(args),
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
  name: 'atomic-result-section-children',
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  afterEach,
  args: {
    'default-slot': `
      <div class="p-3 mt-2 ml-4 border border-gray-200 rounded-lg bg-gray-50">
        <div class="mb-2 text-sm font-medium text-gray-700">Related Results:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• Wireless Charging Case - $79.99</div>
          <div class="text-sm text-gray-600">• Premium Foam Tips - $29.99</div>
        </div>
      </div>
    `,
  },
};
