import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html, render, TemplateResult} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-result-list/atomic-result-list.js';
import '@/src/components/search/atomic-result-template/atomic-result-template.js';
import '@/src/components/search/atomic-result-link/atomic-result-link.js';
import '@/src/components/search/atomic-result-text/atomic-result-text.js';
import '@/src/components/search/atomic-table-element/atomic-table-element.js';

const searchApiHarness = new MockSearchApi();
const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-table-element',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-table-element',
  title: 'Search/Table Element',
  id: 'atomic-table-element',

  render: (args) => template(args),
  decorators: [searchInterfaceDecorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...searchApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
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
  name: 'atomic-table-element',
  args: {
    label: 'Title',
    'default-slot': `<atomic-result-link></atomic-result-link>`,
  },
  decorators: [
    (story) => {
      const templateTag = document.createElement('template');
      const tempContainer = document.createElement('div');

      const storyResult = story();

      if (
        storyResult &&
        typeof storyResult === 'object' &&
        '_$litType$' in storyResult
      ) {
        render(storyResult as TemplateResult, tempContainer);
        templateTag.innerHTML = tempContainer.innerHTML;
      } else {
        templateTag.innerHTML = String(storyResult);
      }

      // Add a second column for context
      templateTag.innerHTML += `
        <atomic-table-element label="Source">
          <atomic-result-text field="source"></atomic-result-text>
        </atomic-table-element>
      `;

      return html`
        <atomic-result-list display="table">
          <atomic-result-template>${templateTag}</atomic-result-template>
        </atomic-result-list>
      `;
    },
  ],
};
