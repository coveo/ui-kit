import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

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
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label">Source:</span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label">Author:</span>
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
  <atomic-result-section-children>
    <atomic-insight-result-children image-size="icon">
      <atomic-insight-result-children-template>
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
          <atomic-result-section-children>
            <atomic-insight-result-children inherit-templates></atomic-insight-result-children>
          </atomic-result-section-children>
        </template>
      </atomic-insight-result-children-template>
    </atomic-insight-result-children>
  </atomic-result-section-children>
</template>`;

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-result-template',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-result-template',
  title: 'Insight/Result Template',
  id: 'atomic-insight-result-template',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
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

const {decorator: insightInterfaceDecorator, play: initializeInsightInterface} =
  wrapInInsightInterface();

export const Default: Story = {
  name: 'In a result list',
  decorators: [
    (story) => html`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list
            display="list"
            density="normal"
            image-size="icon"
          >
            ${story()}
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,
    insightInterfaceDecorator,
  ],
  play: initializeInsightInterface,
};

export const InAFoldedResultList: Story = {
  name: 'In a folded result list',
  args: {
    ...args,
    'default-slot': FOLDED_TEMPLATE_EXAMPLE,
  },
  decorators: [
    (story) => html`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-folded-result-list
            image-size="small"
            display="list"
            collection-field="foldingcollection"
            parent-field="foldingparent"
            child-field="foldingchild"
          >
            ${story()}
          </atomic-insight-folded-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,
    insightInterfaceDecorator,
  ],
  parameters: {
    docs: {
      source: {
        code: `<atomic-insight-folded-result-list
  image-size="small"
  display="list"
  collection-field="foldingcollection"
  parent-field="foldingparent"
  child-field="foldingchild"
>
  <atomic-insight-result-template>
${FOLDED_TEMPLATE_EXAMPLE}
  </atomic-insight-result-template>
</atomic-insight-folded-result-list>`,
      },
    },
  },
  play: initializeInsightInterface,
};

export const WithConditions: Story = {
  name: 'With conditions',
  args: {
    ...args,
    'default-slot': TEMPLATE_EXAMPLE,
  },
  decorators: [
    (story) => html`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list
            display="list"
            density="normal"
            image-size="icon"
          >
            <!-- Template for specific source types -->
            <atomic-insight-result-template must-match-sourcetype="YouTube">
              <template>
                <atomic-result-section-badges>
                  <atomic-result-badge
                    label="YouTube Video"
                    class="youtube-badge"
                  ></atomic-result-badge>
                </atomic-result-section-badges>
                <atomic-result-section-title>
                  <atomic-result-link></atomic-result-link>
                </atomic-result-section-title>
                <atomic-result-section-excerpt>
                  <atomic-result-text field="excerpt"></atomic-result-text>
                </atomic-result-section-excerpt>
              </template>
            </atomic-insight-result-template>
            <!-- Default template -->
            ${story()}
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,
    insightInterfaceDecorator,
  ],
  play: initializeInsightInterface,
};
