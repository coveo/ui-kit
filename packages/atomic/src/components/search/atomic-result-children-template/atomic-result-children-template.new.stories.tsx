/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const CHILD_TEMPLATE_EXAMPLE = `<template>
  <style>
    .field {
      display: inline-flex;
      align-items: center;
    }

    .field-label {
      font-weight: bold;
      margin-right: 0.25rem;
    }
  </style>
  <atomic-result-section-visual>
    <img loading="lazy" src="https://picsum.photos/seed/picsum/350" class="thumbnail" />
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
</template>`;

const PARENT_TEMPLATE_EXAMPLE = `<template>
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
    <img loading="lazy" src="https://picsum.photos/seed/picsum/350" class="thumbnail" />
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
  <atomic-result-section-children slot="children-template">
  </atomic-result-section-children>
</template>`;

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-children-template',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-children-template',
  title: 'Search/Result Children Template',
  id: 'atomic-result-children-template',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'default-slot': CHILD_TEMPLATE_EXAMPLE,
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

const {decorator, play} = wrapInSearchInterface({
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
  name: 'In a folded result list',
  decorators: [
    (story) => html`
      <atomic-folded-result-list image-size="small" display="grid">
        <atomic-result-template>
          ${unsafeHTML(PARENT_TEMPLATE_EXAMPLE)}
        </atomic-result-template>
        <atomic-result-children image-size="image">
          ${story()}
        </atomic-result-children>
      </atomic-folded-result-list>
    `,
    decorator,
  ],
  play,
  parameters: {
    docs: {
      source: {
        code: `<atomic-folded-result-list image-size="small" display="grid">
  <atomic-result-template>
${PARENT_TEMPLATE_EXAMPLE}
  </atomic-result-template>
  <atomic-result-children image-size="image">
    <atomic-result-children-template>
${CHILD_TEMPLATE_EXAMPLE}
    </atomic-result-children-template>
  </atomic-result-children>
</atomic-folded-result-list>`,
      },
    },
  },
};
