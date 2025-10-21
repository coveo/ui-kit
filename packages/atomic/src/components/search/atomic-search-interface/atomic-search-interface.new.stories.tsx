import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

async function initializeSearchInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-interface',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-search-interface',
  title: 'Search/Interface',
  id: 'atomic-search-interface',
  render: (args) => template(args),
  decorators: [(story) => html`<div id="code-root">${story()}</div>`],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  play: async (context) => {
    await initializeSearchInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    await searchInterface!.executeFirstSearch();
  },
  argTypes: {
    ...argTypes,
    engine: {
      ...argTypes,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    urlManager: {
      ...argTypes.urlManager,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    i18n: {
      ...argTypes.i18n,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
  },
  args: {
    ...args,
    engine: undefined,
    i18n: undefined,
    urlManager: undefined,
    language: 'en',
    'default-slot': `<span>Interface content</span>`,
  },
};

export default meta;

export const Default: Story = {};

export const SearchBeforeInit: Story = {
  tags: ['!dev'],
  play: async (context) => {
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    await customElements.whenDefined('atomic-search-interface');
    await searchInterface!.executeFirstSearch();
  },
};

export const WithAResultList: Story = {
  name: 'With a Result List',
  args: {
    'default-slot': `
      <atomic-search-layout>
        <atomic-layout-section section="search">
          <atomic-search-box></atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
             <atomic-facet field="author" label="Authors"></atomic-facet>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-breadbox></atomic-breadbox>
            <atomic-query-summary></atomic-query-summary>
            <atomic-sort-dropdown>
              <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
              <atomic-sort-expression label="most-recent" expression="date descending"></atomic-sort-expression>
            </atomic-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-result-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-result-list>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    `,
  },
};
