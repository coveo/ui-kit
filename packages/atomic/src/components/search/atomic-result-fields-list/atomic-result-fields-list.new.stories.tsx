import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => {
  return {
    ...response,
    results: response.results
      .map((result) => ({
        ...result,
        raw: {
          ...result.raw,
          author: 'John Doe',
          source: 'Documentation',
          language: ['en', 'fr'],
          filetype: 'pdf',
          date: Date.now(),
        },
      }))
      .slice(0, 1),
    totalCount: 1,
    totalCountFiltered: 1,
  };
});

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-fields-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-fields-list',
  title: 'Search/Result Fields List',
  id: 'atomic-result-fields-list',

  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'default-slot': `
          <style>
        .field {
          display: inline-flex;
          white-space: nowrap;
          align-items: center;
        }
        .field-label {
          font-weight: bold;
          margin-right: 0.25rem;
        }
      </style>
      <span class="field">
        <span class="field-label"><atomic-text value="author"></atomic-text>:</span>
        <atomic-result-text field="author"></atomic-result-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
        <atomic-result-text field="source"></atomic-result-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="language"></atomic-text>:</span>
        <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
      </span>

      <span class="field">
        <span class="field-label"><atomic-text value="fileType"></atomic-text>:</span>
        <atomic-result-text field="filetype"></atomic-result-text>
      </span>
    `,
  },
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};
