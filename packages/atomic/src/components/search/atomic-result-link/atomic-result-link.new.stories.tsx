import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 1),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  skipFirstSearch: false,
  includeCodeRoot: false,
});

const customResultListDecorator: Decorator = (story) => html`
  <atomic-result-list
    display="list"
    number-of-placeholders="1"
    density="compact"
    image-size="small"
  >
    ${story()}
  </atomic-result-list>
`;
const {decorator: resultTemplateDecorator} = wrapInResultTemplate(false);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-link',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-link',
  title: 'Search/Result Link',
  id: 'atomic-result-link',
  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    customResultListDecorator,
    searchInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
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
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="https://picsum.photos/seed/atomic-result-link/100/100" alt="Thumbnail" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" />
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
