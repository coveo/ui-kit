/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {bypass, HttpResponse, http} from 'msw';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const SLOTS_DEFAULT = `
<atomic-result-template>
  <template>
    <atomic-result-section-visual>
      <atomic-result-image class="icon" fallback="https://picsum.photos/350"></atomic-result-image>
      <img src="https://picsum.photos/350" class="thumbnail" />
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
        <!-- CHILD -->
        <atomic-result-children-template>
          <!-- CHILD TEMPLATE -->
          <template>
            <atomic-result-section-visual>
              <atomic-result-image class="icon" fallback="https://picsum.photos/350"></atomic-result-image>
              <img src="https://picsum.photos/350" class="thumbnail" />
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

const preprocessRequest = (response: any) => {
  const parsed = JSON.parse(response.body as string);
  parsed.aq = '@source==("iNaturalistTaxons")';
  parsed.fieldsToInclude = [...(parsed.fieldsToInclude || []), 'source'];
  response.body = JSON.stringify(parsed);
  return response;
};

const {decorator, play} = wrapInSearchInterface({
  preprocessRequest,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-folded-result-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-folded-result-list',
  title: 'Search/FoldedResultList',
  id: 'atomic-folded-result-list',
  render: (args) => template(args),
  decorators: [decorator],
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
  name: 'atomic-folded-result-list',
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
};

const preprocessRequestNoChildrenResult = (request: any) => {
  const parsed = JSON.parse(request.body as string);
  parsed.aq = '@foldingcollection==("atlcontinentantarctica")';
  request.body = JSON.stringify(parsed);
  return request;
};

const {play: noResultChildrenPlay} = wrapInSearchInterface({
  preprocessRequest: preprocessRequestNoChildrenResult,
});

export const WithNoResultChildren: Story = {
  name: 'With no result children',
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  play: noResultChildrenPlay,
};

export const WithFewResultChildren: Story = {
  name: 'With result children',
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('**/search/v2', async ({request}) => {
          const response = await fetch(bypass(request));
          const body = await response.json();

          // Modify the first result to have result children
          if (body.results?.[0]) {
            body.results[0].totalNumberOfChildResults = 1;
          }

          return HttpResponse.json(body);
        }),
      ],
    },
  },
  play,
};

export const WithMoreResultsAvailableAndNoChildren: Story = {
  name: 'With more results available and no children',
  args: {
    'default-slot': SLOTS_DEFAULT,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('**/search/v2', async ({request}) => {
          const response = await fetch(bypass(request));
          const body = await response.json();

          // Modify the first result to have no results available
          if (body.results?.[0]) {
            body.results[0].totalNumberOfChildResults = 10;
          }

          return HttpResponse.json(body);
        }),
      ],
    },
  },
  play: noResultChildrenPlay,
};
