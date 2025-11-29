import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import './atomic-result-icon';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-icon',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      console.log(parsed);
      parsed.numberOfResults = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

const {decorator: resultListDecorator} = wrapInResultList('list');
const {decorator: resultTemplateDecorator} = wrapInResultTemplate(false);

const meta: Meta = {
  component: 'atomic-result-icon',
  title: 'Search/ResultList/ResultIcon',
  id: 'atomic-result-icon',
  render: (args) => template(args),
  decorators: [
    (story) => html`
        <atomic-result-section-visual id="code-root">
          ${story()}
        </atomic-result-section-visual>    
      `,
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
  name: 'atomic-result-icon',
};
