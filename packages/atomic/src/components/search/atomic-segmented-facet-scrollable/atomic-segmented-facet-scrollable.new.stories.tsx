import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-segmented-facet-scrollable',
  title: 'Search/SegmentedFacetScrollable',
  id: 'atomic-segmented-facet-scrollable',
  render: () => html`
    <atomic-segmented-facet-scrollable>
      <atomic-segmented-facet
        field="objecttype"
        label="Object Type"
      ></atomic-segmented-facet>
    </atomic-segmented-facet-scrollable>
  `,
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-segmented-facet-scrollable',
};

export const WithMultipleFacets: Story = {
  name: 'With multiple facets',
  render: () => html`
    <atomic-segmented-facet-scrollable>
      <atomic-segmented-facet
        field="objecttype"
        label="Object Type"
        number-of-values="5"
      ></atomic-segmented-facet>
      <atomic-segmented-facet
        field="author"
        label="Author"
        number-of-values="5"
      ></atomic-segmented-facet>
      <atomic-segmented-facet
        field="language"
        label="Language"
        number-of-values="5"
      ></atomic-segmented-facet>
    </atomic-segmented-facet-scrollable>
  `,
};

export const WithManyFacetValues: Story = {
  name: 'With many facet values (scrollable)',
  render: () => html`
    <atomic-segmented-facet-scrollable>
      <atomic-segmented-facet
        field="objecttype"
        label="Object Type"
        number-of-values="50"
      ></atomic-segmented-facet>
    </atomic-segmented-facet-scrollable>
  `,
};

export const WithNoResults: Story = {
  name: 'With no results',
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
      facets: [],
    }));
  },
  play,
};

export const WithError: Story = {
  name: 'With search error',
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockErrorOnce();
  },
  play,
};
