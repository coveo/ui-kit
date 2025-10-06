import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplateForSections} from '@/storybook-utils/search/result-template-section-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-section-visual',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, afterEach} = wrapInSearchInterface({
  config: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('grid', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplateForSections();
const meta: Meta = {
  component: 'atomic-result-section-visual',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-visual',
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
  name: 'atomic-result-section-visual',
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  afterEach,
  args: {
    'default-slot': `<img src="https://images.barca.group/Sports/mj/Clothing/Pants/67_Men_Gray_Elastane/cb1a7d3c9ac3_bottom_left.webp" alt="Result Image" class="w-full h-auto rounded-lg">`,
  },
};
