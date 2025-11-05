import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-link',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface();
const {decorator: resultListDecorator} = wrapInResultList(undefined, false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const meta: Meta = {
  component: 'atomic-result-link',
  title: 'Search/Result Link',
  id: 'atomic-result-link',
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

export const Default: Story = {};

export const WithSlotsAttributes: Story = {
  name: 'With a slot for attributes',
  decorators: [
    () => {
      return html`
        <atomic-result-link>
          <a slot="attributes" target="_blank"></a>
        </atomic-result-link>
      `;
    },
  ],
};

export const WithAlternativeContent: Story = {
  name: 'With alternative content',
  decorators: [
    () => {
      return html`
        <atomic-result-link>
          <div>
            <img src="https://picsum.photos/350" class="thumbnail" />
          </div>
        </atomic-result-link>
      `;
    },
  ],
};

export const WithHrefTemplate: Story = {
  name: 'With an href template',
  decorators: [
    () => {
      return html`
        <atomic-result-link
          href-template="\${clickUri}?source=\${raw.source}"
        ></atomic-result-link>
      `;
    },
  ],
};
