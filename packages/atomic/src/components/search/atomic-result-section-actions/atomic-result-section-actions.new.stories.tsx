import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplateForSections} from '@/storybook-utils/search/result-template-section-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-section-actions',
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
  component: 'atomic-result-section-actions',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-actions',
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
  name: 'atomic-result-section-actions',
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  afterEach,
  args: {
    'default-slot': `<button class="btn btn-primary">Add to Cart</button>`,
  },
};
