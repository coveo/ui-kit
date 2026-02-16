import {
  loadAttachedResultsActions,
  loadCaseContextActions,
} from '@coveo/headless/insight';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html, unsafeStatic} from 'lit/static-html.js';
import type {AtomicInsightInterface} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

const CASE_ID = 'test-case-1234';

const {decorator: insightInterfaceDecorator, play: initializeInsightInterface} =
  wrapInInsightInterface(undefined, true);

const {events, args, argTypes} = getStorybookHelpers(
  'atomic-insight-result-attach-to-case-indicator',
  {excludeCategories: ['methods']}
);

const TEMPLATE_WITH_INDICATOR = `<template>
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
  <atomic-insight-result-action-bar>
    <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
  </atomic-insight-result-action-bar>
  <atomic-result-section-actions>
    <atomic-insight-result-attach-to-case-indicator></atomic-insight-result-attach-to-case-indicator>
  </atomic-result-section-actions>
  <atomic-result-section-title>
    <atomic-result-link></atomic-result-link>
  </atomic-result-section-title>
  <atomic-result-section-excerpt>
    <atomic-result-text field="excerpt"></atomic-result-text>
  </atomic-result-section-excerpt>
  <atomic-result-section-bottom-metadata>
    <atomic-result-fields-list>
      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>
    </atomic-result-fields-list>
  </atomic-result-section-bottom-metadata>
</template>`;

const meta: Meta = {
  component: 'atomic-insight-result-attach-to-case-indicator',
  title: 'Insight/Result Attach To Case Indicator',
  id: 'atomic-insight-result-attach-to-case-indicator',
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: () => {
    mockInsightApi.searchEndpoint.clear();
  },
};

export default meta;

export const Default: Story = {
  name: 'In a result list',
  decorators: [
    () => html`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list display="list" density="normal">
            <atomic-insight-result-template>
              ${unsafeStatic(TEMPLATE_WITH_INDICATOR)}
            </atomic-insight-result-template>
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,
    insightInterfaceDecorator,
  ],
  render: () => html``,
  play: async (context) => {
    const {canvasElement, step} = context;
    await initializeInsightInterface(context);

    const insightInterface =
      canvasElement.querySelector<AtomicInsightInterface>(
        'atomic-insight-interface'
      );
    const engine = insightInterface!.engine!;

    await step('Set case context', async () => {
      const {setCaseId} = loadCaseContextActions(engine);
      engine.dispatch(setCaseId(CASE_ID));
    });

    await step('Pre-attach multiple results', async () => {
      const {attachResult} = loadAttachedResultsActions(engine);

      const attachedResultIndices = [0, 2, 3, 7];
      for (const index of attachedResultIndices) {
        engine.dispatch(
          attachResult({
            caseId: CASE_ID,
            title: `Support Article ${index}: Troubleshooting Guide`,
            resultUrl: `https://support.example.com/article/${index}`,
            permanentId: `insight-perm-id-${index}`,
            uriHash: `insight-hash-${index}`,
          })
        );
      }
    });

    await step('Execute the first search', async () => {
      await insightInterface!.executeFirstSearch();
    });
  },
};
