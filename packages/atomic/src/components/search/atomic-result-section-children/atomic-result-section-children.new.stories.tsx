import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  getResultSectionArgs,
  getResultSectionArgTypes,
  getResultSectionDecorators,
} from '@/storybook-utils/search/result-section-story-utils';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-section-children',
  {excludeCategories: ['methods']}
);

const {play} = wrapInSearchInterface({
  config: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.numberOfResults = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
  includeCodeRoot: false,
});
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
  args: {
    ...args,
    ...getResultSectionArgs(),
  },
  argTypes: {
    ...argTypes,
    ...getResultSectionArgTypes(),
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-section-children',
  decorators: getResultSectionDecorators(),
  play,
  args: {
    'default-slot': `
      <div class="p-3 mt-2 ml-4 border border-gray-200 rounded-lg bg-gray-50">
        <div class="mb-2 text-sm font-medium text-gray-700">Related Articles:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• How to train for a marathon</div>
          <div class="text-sm text-gray-600">• Running 101</div>
        </div>
      </div>
    `,
  },
};
