import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  playExecuteFirstSearch,
  wrapInSearchInterface,
} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface({}, true);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-category-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-category-facet',
  title: 'Search/CategoryFacet',
  id: 'atomic-category-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
  args: {
    ...args,
    numberOfValues: 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-category-facet',
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
};

export const LowFacetValues: Story = {
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    'number-of-values': 2,
    'with-search': true,
  },
};

export const WithCustomAllCategoriesLabelById: Story = {
  name: 'With custom all categories label, using facetId',
  tags: ['!dev'],
  play: async (context) => {
    await play(context);
    const searchInterface =
      context.canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
        'atomic-search-interface'
      );
    searchInterface.i18n.addResourceBundle('en', 'translation', {
      'all-categories-my-awesome-facet': 'My Awesome Facet',
    });
    await playExecuteFirstSearch(context);
  },
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'facet-id': 'my-awesome-facet',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
};

export const WithCustomAllCategoriesLabelByField: Story = {
  tags: ['!dev'],
  name: 'With custom all categories label, using field',
  play: async (context) => {
    await play(context);
    const searchInterface =
      context.canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
        'atomic-search-interface'
      );
    searchInterface.i18n.addResourceBundle('en', 'translation', {
      'all-categories-geographicalhierarchy': 'My Awesome Facet',
    });
    await playExecuteFirstSearch(context);
  },
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
};

export const WithCustomAllCategoriesLabelWithIdAndFieldCompeting: Story = {
  tags: ['!dev'],
  name: 'With custom all categories label, using field',
  play: async (context) => {
    await play(context);
    const searchInterface =
      context.canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
        'atomic-search-interface'
      );
    searchInterface.i18n.addResourceBundle('en', 'translation', {
      'all-categories-geographicalhierarchy': 'My Super Awesome Facet',
    });
    searchInterface.i18n.addResourceBundle('en', 'translation', {
      'all-categories-my-awesome-facet': 'My Awesome Facet',
    });
    await playExecuteFirstSearch(context);
  },
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'facet-id': 'my-awesome-facet',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
};
