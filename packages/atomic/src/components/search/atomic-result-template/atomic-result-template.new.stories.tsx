/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {parameters as searchBoxParameters} from '@/storybook-utils/common/search-box-suggestions-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const TEMPLATE_EXAMPLE = `<template>
  <atomic-result-section-visual>
    <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350"></atomic-result-image>
  </atomic-result-section-visual>
  <atomic-result-section-badges>
    <atomic-field-condition must-match-sourcetype="YouTube">
      <atomic-result-badge
        label="YouTube"
        class="youtube-badge"
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
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label">
          <atomic-text value="source"></atomic-text>:
        </span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label">
          <atomic-text value="author"></atomic-text>:
        </span>
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="date">
        <span class="field-label">
          <atomic-text value="date"></atomic-text>:
        </span>
        <atomic-result-date></atomic-result-date>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
</template>`;

const FOLDED_TEMPLATE_EXAMPLE = `<template>
  <style>
    .field {
      display: inline-flex;
      align-items: center;
    }

    .field-label {
      font-weight: bold;
      margin-right: 0.25rem;
    }

    .thumbnail {
      border-radius: var(--atomic-border-radius);
    }
  </style>
  <atomic-result-section-visual>
    <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/picsum/350" class="thumbnail"></atomic-result-image>
  </atomic-result-section-visual>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="inat_kingdom">
        <span class="field-label">Kingdom:</span>
        <atomic-result-text field="inat_kingdom"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="inat_family">
        <span class="field-label">Family:</span>
        <atomic-result-text field="inat_family"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="inat_class">
        <span class="field-label">Class:</span>
        <atomic-result-text field="inat_class"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
  <atomic-result-section-children>
    <atomic-result-children image-size="icon">
      <atomic-result-children-template>
        <template>
          <style>
            .field {
              display: inline-flex;
              align-items: center;
            }

            .field-label {
              font-weight: bold;
              margin-right: 0.25rem;
            }

            .child-thumbnail {
              border-radius: var(--atomic-border-radius);
            }
          </style>
          <atomic-result-section-visual>
            <atomic-result-image field="ytthumbnailurl" fallback="https://picsum.photos/seed/child/200" class="child-thumbnail"></atomic-result-image>
          </atomic-result-section-visual>
          <atomic-result-section-title>
            <atomic-result-link></atomic-result-link>
          </atomic-result-section-title>
          <atomic-result-section-excerpt>
            <atomic-result-text field="excerpt"></atomic-result-text>
          </atomic-result-section-excerpt>
          <atomic-result-section-bottom-metadata>
            <atomic-result-fields-list>
              <atomic-field-condition class="field" if-defined="inat_kingdom">
                <span class="field-label">Kingdom:</span>
                <atomic-result-text field="inat_kingdom"></atomic-result-text>
              </atomic-field-condition>
              <atomic-field-condition class="field" if-defined="inat_family">
                <span class="field-label">Family:</span>
                <atomic-result-text field="inat_family"></atomic-result-text>
              </atomic-field-condition>
              <atomic-field-condition class="field" if-defined="inat_class">
                <span class="field-label">Class:</span>
                <atomic-result-text field="inat_class"></atomic-result-text>
              </atomic-field-condition>
            </atomic-result-fields-list>
          </atomic-result-section-bottom-metadata>
          <atomic-result-section-children>
            <atomic-result-children inherit-templates></atomic-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-result-children-template>
    </atomic-result-children>
  </atomic-result-section-children>
</template>`;

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-template',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-template',
  title: 'Search/Result Template',
  id: 'atomic-result-template',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'default-slot': TEMPLATE_EXAMPLE,
  },
  argTypes: {
    ...argTypes,
    'must-match': {
      ...argTypes['must-match'],
      control: false,
    },
    'must-not-match': {
      ...argTypes['must-not-match'],
      control: false,
    },
    conditions: {
      ...argTypes.conditions,
      control: false,
    },
  },
};

export default meta;

const {decorator: searchInterfaceDecorator, play: initializeSearchInterface} =
  wrapInSearchInterface({
    config: {
      preprocessRequest: (request: any) => {
        const parsed = JSON.parse(request.body as string);
        parsed.numberOfResults = 4;
        request.body = JSON.stringify(parsed);
        return request;
      },
    },
    skipFirstSearch: false,
    includeCodeRoot: false,
  });

const {
  decorator: foldedSearchInterfaceDecorator,
  play: initializeFoldedSearchInterface,
} = wrapInSearchInterface({
  config: {
    preprocessRequest: (request: any) => {
      const parsed = JSON.parse(request.body as string);
      parsed.numberOfResults = 4;
      parsed.aq = '@source=iNaturalistTaxons';
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
  skipFirstSearch: false,
  includeCodeRoot: false,
});

export const Default: Story = {
  name: 'In a result list',
  decorators: [
    (story) => html`
      <atomic-result-list display="list" density="normal" image-size="icon">
        ${story()}
      </atomic-result-list>
    `,
    searchInterfaceDecorator,
  ],
  play: initializeSearchInterface,
};

export const InAFoldedResultList: Story = {
  name: 'In a folded result list',
  args: {
    ...args,
    'default-slot': FOLDED_TEMPLATE_EXAMPLE,
  },
  decorators: [
    (story) => html`
      <atomic-folded-result-list
        image-size="small"
        display="grid"
        collection-field="foldingcollection"
        parent-field="foldingparent"
        child-field="foldingchild"
      >
        ${story()}
      </atomic-folded-result-list>
    `,
    foldedSearchInterfaceDecorator,
  ],
  parameters: {
    docs: {
      source: {
        code: `<atomic-folded-result-list
  image-size="small"
  display="grid"
  collection-field="foldingcollection"
  parent-field="foldingparent"
  child-field="foldingchild"
>
  <atomic-result-template>
${FOLDED_TEMPLATE_EXAMPLE}
  </atomic-result-template>
</atomic-folded-result-list>`,
      },
    },
  },
  play: initializeFoldedSearchInterface,
};

export const InASearchBoxInstantResults: Story = {
  name: 'In a search box instant results',
  decorators: [
    (story) => html`
      <atomic-search-box style="width: 600px;">
        <atomic-search-box-query-suggestions>
          <atomic-search-box-instant-results>
            ${story()}
          </atomic-search-box-instant-results>
        </atomic-search-box-query-suggestions>
      </atomic-search-box>
    `,
    searchInterfaceDecorator,
  ],
  parameters: searchBoxParameters,
  play: async (context) => {
    await initializeSearchInterface(context);
    const {canvas, step} = context;
    await step('Click Searchbox', async () => {
      (
        await canvas.findAllByShadowTitle('Search field with suggestions.', {
          exact: false,
        })
      )
        ?.find((el) => el.getAttribute('part') === 'textarea')
        ?.focus();
    });
  },
};
