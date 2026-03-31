import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  getResultSectionArgs,
  getResultSectionArgTypes,
  getResultSectionDecorators,
} from '@/storybook-utils/search/result-section-story-utils';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

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

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-section-excerpt',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-section-excerpt',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-excerpt',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
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
  name: 'atomic-result-section-excerpt',
  decorators: getResultSectionDecorators(),
  play,
  args: {
    'default-slot': `<p class="text-sm text-gray-600">The palm cockatoo is thought to be the only bird species to use tools musically – drumming wood to attract a mate.</p>`,
  },
};
