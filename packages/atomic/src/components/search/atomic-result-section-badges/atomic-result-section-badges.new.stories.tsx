import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplateForSections} from '@/storybook-utils/search/result-template-section-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-section-badges',
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
  component: 'atomic-result-section-badges',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-badges',
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
  name: 'atomic-result-section-badges',
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  afterEach,
  args: {
    'default-slot': `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span class="badge badge-primary" style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW</span>
        <span class="badge badge-secondary" style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">SALE</span>
        <span class="badge badge-success" style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">BESTSELLER</span>
      </div>
    `,
  },
};
