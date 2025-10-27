import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-quickview',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (request) => {
    const fakeQuery = 'test';
    switch (
      (request.headers as Record<string, string> | undefined)?.['Content-Type']
    ) {
      case 'application/json': {
        const parsed = JSON.parse(request.body as string);
        parsed.aq = '@filetype=pdf';
        parsed.q = fakeQuery;
        parsed.numberOfResults = 1;
        request.body = JSON.stringify(parsed);
        break;
      }
      case 'application/x-www-form-urlencoded':
        if (!request.body) {
          break;
        }
        request.body = (request.body as string).replace(
          'q=&',
          `q=${encodeURIComponent(fakeQuery)}&`
        );
        break;
    }
    return request;
  },
});
const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: engineConfig,
});

export const OutsideResultTemplate: Story = {
  name: 'Not inside a result template',
  tags: ['test'],
  render: (args) => template(args),
  decorators: [searchInterfaceDecorator],
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

const meta: Meta = {
  component: 'atomic-quickview',
  title: 'Search/ResultList/Quickview',
  id: 'atomic-quickview',
  render: (args) => template(args),
  decorators: [resultDecorator, searchInterfaceDecorator],
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
  name: 'atomic-quick-view',
};
