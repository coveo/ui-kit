import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const CircleIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-rating',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.aq = '@snrating';
      parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'snrating'];
      parsed.numberOfResults = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

const {decorator: resultListDecorator} = wrapInResultList(undefined, false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const meta: Meta = {
  component: 'atomic-result-rating',
  title: 'Search/Result Rating',
  id: 'atomic-result-rating',
  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  args: {field: 'snrating'},
};

export const WithAMaxValueInIndex: Story = {
  name: 'With a custom max value',
  args: {
    field: 'snrating',
    'max-value-in-index': 10,
  },
};

export const WithADifferentIcon: Story = {
  name: 'With a custom icon',
  args: {
    field: 'snrating',
    icon: CircleIcon,
  },
};
