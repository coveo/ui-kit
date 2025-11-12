import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: {
    search: {
      preprocessSearchResponseMiddleware: (res) => {
        res.body.results = res.body.results.slice(0, 1);
        res.body.results.forEach((r) => {
          r.excerpt = '<div>Some HTML content</div>';
        });
        return res;
      },
    },
  },
  includeCodeRoot: false,
});

const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-html',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-html',
  title: 'Search/Result HTML',
  id: 'atomic-result-html',
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
  args: {field: 'excerpt'},
};
