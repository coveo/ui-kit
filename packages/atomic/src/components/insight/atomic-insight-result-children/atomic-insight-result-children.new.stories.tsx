import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {
  baseFoldedResponse,
  MockInsightApi,
} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import {wrapInInsightFoldedResultList} from '@/storybook-utils/insight/insight-result-list-wrapper';
import {wrapInInsightResultTemplate} from '@/storybook-utils/insight/insight-result-template-wrapper';

const insightApiHarness = new MockInsightApi();

const {decorator: insightInterfaceDecorator, play} = wrapInInsightInterface(
  {},
  false,
  false
);
const {decorator: insightFoldedResultListDecorator} =
  wrapInInsightFoldedResultList('list', false);
const {decorator: insightResultTemplateDecorator} =
  wrapInInsightResultTemplate(false);

const {events, args, argTypes, styleTemplate} = getStorybookHelpers(
  'atomic-insight-result-children',
  {excludeCategories: ['methods']}
);

const childrenTemplate = html`
  <atomic-insight-result-children-template>
    <template>
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
    </template>
  </atomic-insight-result-children-template>
`;

const meta: Meta = {
  component: 'atomic-insight-result-children',
  title: 'Insight/Result Children',
  id: 'atomic-insight-result-children',
  render: (args) => html`
    ${styleTemplate(args)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${args['image-size'] || 'icon'}
        inherit-templates=${args['inherit-templates'] || false}
      >
        ${childrenTemplate}
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,
  decorators: [
    insightResultTemplateDecorator,
    insightFoldedResultListDecorator,
    insightInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  args: {
    ...args,
    'image-size': 'icon',
  },
  argTypes,
  beforeEach: async () => {
    insightApiHarness.searchEndpoint.clear();
    insightApiHarness.searchEndpoint.mockOnce(() => baseFoldedResponse);
  },
  play,
};

export default meta;

export const Default: Story = {};

export const WithBeforeChildrenSlot: Story = {
  name: 'With before-children slot',
  render: (args) => html`
    ${styleTemplate(args)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${args['image-size'] || 'icon'}
        inherit-templates=${args['inherit-templates'] || false}
      >
        <div slot="before-children" class="text-sm text-neutral-dark">
          Related documents:
        </div>
        ${childrenTemplate}
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,
};

export const WithAfterChildrenSlot: Story = {
  name: 'With after-children slot',
  render: (args) => html`
    ${styleTemplate(args)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${args['image-size'] || 'icon'}
        inherit-templates=${args['inherit-templates'] || false}
      >
        ${childrenTemplate}
        <div slot="after-children" class="text-sm text-neutral-dark mt-2">
          End of related documents
        </div>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,
};

export const WithBothSlots: Story = {
  name: 'With both slots',
  render: (args) => html`
    ${styleTemplate(args)}
    <atomic-result-section-title>
      <atomic-result-link></atomic-result-link>
    </atomic-result-section-title>
    <atomic-result-section-children id="code-root">
      <atomic-insight-result-children
        image-size=${args['image-size'] || 'icon'}
        inherit-templates=${args['inherit-templates'] || false}
      >
        <div slot="before-children" class="text-sm text-neutral-dark">
          Related documents:
        </div>
        ${childrenTemplate}
        <div slot="after-children" class="text-sm text-neutral-dark mt-2">
          End of related documents
        </div>
      </atomic-insight-result-children>
    </atomic-result-section-children>
  `,
};
