/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {baseFoldedResponse} from '@/storybook-utils/api/insight/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const SLOTS_DEFAULT = `
<atomic-insight-result-template>
  <template>
    <atomic-result-section-visual>
      <atomic-result-image class="icon" fallback="https://picsum.photos/seed/insight/350"></atomic-result-image>
      <img src="https://picsum.photos/seed/insight/350" alt="Thumbnail" class="thumbnail" />
    </atomic-result-section-visual>
    <atomic-result-section-badges>
      <atomic-field-condition must-match-sourcetype="KnowledgeBase">
        <atomic-result-badge
          label="Knowledge Base"
          class="kb-badge"
        ></atomic-result-badge>
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
              <atomic-result-image class="icon" fallback="https://picsum.photos/seed/insight/350"></atomic-result-image>
              <img src="https://picsum.photos/seed/insight/350" alt="Thumbnail" class="thumbnail" />
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
</atomic-insight-result-template>
`;

const mockInsightApi = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-folded-result-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-folded-result-list',
  title: 'Insight/Folded Result List',
  id: 'atomic-insight-folded-result-list',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockInsightApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.clear();
  },
  play,
  tags: ['!dev'],
};

export default meta;

export const Default: Story = {
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mockOnce(() => baseFoldedResponse);
    mockInsightApi.searchEndpoint.mockOnce(() => {
      const results = baseFoldedResponse.results;
      results[0]!.childResults.push({
        title: 'Security Best Practices',
        excerpt: 'Essential security guidelines',
        clickUri: 'https://support.example.com/kb/security',
        uniqueId: 'kb-security-child',
        raw: {
          foldingcollection: 'Knowledge Base',
          foldingchild: ['security'],
          foldingparent: 'kb',
        },
      });
      results[0].totalNumberOfChildResults = 3;
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
    mockInsightApi.searchEndpoint.mockOnce(() => ({
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
    mockInsightApi.searchEndpoint.mockOnce(() => ({
      ...baseFoldedResponse,
      results: [
        {
          ...baseFoldedResponse.results[0]!,
          totalNumberOfChildResults: 2,
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
    mockInsightApi.searchEndpoint.mockOnce(() => ({
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
