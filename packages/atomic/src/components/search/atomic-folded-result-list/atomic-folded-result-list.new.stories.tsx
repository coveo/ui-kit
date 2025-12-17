/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {baseFoldedResponse} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const SLOTS_DEFAULT = `
<atomic-result-template>
  <template>
    <atomic-result-section-visual>
      <atomic-result-image class="icon" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
      <img src="https://picsum.photos/seed/picsum/350" alt="Thumbnail" class="thumbnail" />
    </atomic-result-section-visual>
    <atomic-result-section-badges>
      <atomic-field-condition must-match-sourcetype="Salesforce">
        <atomic-result-badge
          label="Salesforce"
          class="salesforce-badge"
        ></atomic-result-badge>
      </atomic-field-condition>             
      <atomic-result-badge
        icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg"
      >
        <atomic-result-multi-value-text
          field="language"
        ></atomic-result-multi-value-text>
      </atomic-result-badge>
      <atomic-field-condition must-match-is-recommendation="true">
        <atomic-result-badge label="Recommended"></atomic-result-badge>
      </atomic-field-condition>
      <atomic-field-condition must-match-is-top-result="true">
        <atomic-result-badge label="Top Result"></atomic-result-badge>
      </atomic-field-condition>
    </atomic-result-section-badges>
    <atomic-result-section-title
      ><atomic-result-link></atomic-result-link
    ></atomic-result-section-title>
    <atomic-result-section-excerpt
      ><atomic-result-text field="excerpt"></atomic-result-text
    ></atomic-result-section-excerpt>
    <atomic-result-section-bottom-metadata>
      <atomic-result-fields-list>
        <atomic-field-condition class="field" if-defined="source">
          <span class="field-label"
            ><atomic-text value="source"></atomic-text>:</span
          >
          <atomic-result-text field="source"></atomic-result-text>
        </atomic-field-condition>
      </atomic-result-fields-list>
    </atomic-result-section-bottom-metadata>
    <atomic-result-section-children>
      <atomic-result-children image-size="icon">
        <atomic-result-children-template>
          <template>
            <atomic-result-section-visual>
              <atomic-result-image class="icon" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
              <img src="https://picsum.photos/seed/picsum/350" alt="Thumbnail" class="thumbnail" />
            </atomic-result-section-visual>
            <atomic-result-section-title
              ><atomic-result-link></atomic-result-link
            ></atomic-result-section-title>
            <atomic-result-section-excerpt
              ><atomic-result-text field="excerpt"></atomic-result-text
            ></atomic-result-section-excerpt>
            <atomic-result-section-bottom-metadata>
              <atomic-result-fields-list>
                <atomic-field-condition class="field" if-defined="author">
                  <span class="field-label"
                    ><atomic-text value="author"></atomic-text>:</span
                  >
                  <atomic-result-text field="author"></atomic-result-text>
                </atomic-field-condition>

                <atomic-field-condition class="field" if-defined="source">
                  <span class="field-label"
                    ><atomic-text value="source"></atomic-text>:</span
                  >
                  <atomic-result-text field="source"></atomic-result-text>
                </atomic-field-condition>

                <atomic-field-condition
                  class="field"
                  if-defined="language"
                >
                  <span class="field-label"
                    ><atomic-text value="language"></atomic-text>:</span
                  >
                  <atomic-result-multi-value-text
                    field="language"
                  ></atomic-result-multi-value-text>
                </atomic-field-condition>

                <atomic-field-condition
                  class="field"
                  if-defined="filetype"
                >
                  <span class="field-label"
                    ><atomic-text value="fileType"></atomic-text>:</span
                  >
                  <atomic-result-text
                    field="filetype"
                  ></atomic-result-text>
                </atomic-field-condition>
              </atomic-result-fields-list>
            </atomic-result-section-bottom-metadata>
            <atomic-result-section-children>
              <atomic-result-children inherit-templates>
              </atomic-result-children>
            </atomic-result-section-children>
          </template>
        </atomic-result-children-template>
      </atomic-result-children>
    </atomic-result-section-children>
  </template>
</atomic-result-template>
`;

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-folded-result-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-folded-result-list',
  title: 'Search/Folded Result List',
  id: 'atomic-folded-result-list',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => baseFoldedResponse);
    mockSearchApi.searchEndpoint.mockOnce(() => {
      const results = baseFoldedResponse.results;
      results[0]!.childResults.push({
        title: 'Birds',
        excerpt: 'Bird species',
        clickUri: 'https://example.com/birds',
        uniqueId: 'birds-child',
        raw: {
          foldingcollection: 'Animals',
          foldingchild: ['birds'],
          foldingparent: 'animals',
        },
      });
      results[0].totalNumberOfChildResults = 1;
      return {
        ...baseFoldedResponse,
        results,
      };
    });
  },
  play,
};

export const WithNoResultChildren: Story = {
  name: 'With no result children',
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [
        {
          ...baseFoldedResponse.results[0],
          parentResult: null,
          totalNumberOfChildResults: 0,
          childResults: [],
        },
      ] as unknown as typeof baseFoldedResponse.results,
    }));
  },
  play,
};

export const WithFewResultChildren: Story = {
  name: 'With result children',
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [
        {
          ...baseFoldedResponse.results[0]!,
          totalNumberOfChildResults: 1,
        },
        ...baseFoldedResponse.results.slice(1),
      ],
    }));
  },
  play,
};

export const WithMoreResultsAvailableAndNoChildren: Story = {
  name: 'With more results available and no children',
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [
        {
          ...baseFoldedResponse.results[0]!,
          totalNumberOfChildResults: 10,
          childResults: [],
        },
      ],
    }));
  },
  play,
};
