import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import '@/src/components/insight/atomic-insight-layout/atomic-insight-layout';
import '@/src/components/common/atomic-layout-section/atomic-layout-section';

const {decorator: insightInterfaceDecorator, play: initializeInsightInterface} =
  wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-result-list',
  {
    excludeCategories: ['methods'],
  }
);

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

const layoutDecorator = (story: () => unknown) => html`
  <atomic-insight-layout>
    <atomic-layout-section section="results"> ${story()} </atomic-layout-section>
  </atomic-insight-layout>
`;

const meta: Meta = {
  component: 'atomic-insight-result-list',
  title: 'Insight/Result List',
  id: 'atomic-insight-result-list',

  render: (args) => template(args),
  decorators: [layoutDecorator, insightInterfaceDecorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'default-slot': `<atomic-insight-result-template>${TEMPLATE_EXAMPLE}</atomic-insight-result-template>`,
  },
  argTypes: {
    ...argTypes,
    density: {
      control: 'select',
      options: ['normal', 'comfortable', 'compact'],
    },
    'image-size': {
      control: 'select',
      options: ['icon', 'small', 'large', 'none'],
    },
  },
  play: initializeInsightInterface,
};

export default meta;

export const Default: Story = {};
