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
  'atomic-result-section-bottom-metadata',
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
  component: 'atomic-result-section-bottom-metadata',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-bottom-metadata',
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
  name: 'atomic-result-section-bottom-metadata',
  decorators: getResultSectionDecorators(),
  play,
  args: {
    'default-slot': `
      <div class="text-xs text-gray-500">
        <span>Author: Mark Twain</span>
      </div>
    `,
  },
};
