import {
  loadAttachedResultsActions,
  loadCaseContextActions,
} from '@coveo/headless/insight';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
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
    (story) => html`
      <atomic-insight-layout>
        <atomic-layout-section section="results">
          <atomic-insight-result-list display="list" density="normal">
            <atomic-insight-result-template>
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
                </style>
                <atomic-insight-result-action-bar>
                  <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
                </atomic-insight-result-action-bar>
                <atomic-result-section-actions>
                  ${story()}
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
                      <span class="field-label"
                        ><atomic-text value="source"></atomic-text>:</span
                      >
                      <atomic-result-text field="source"></atomic-result-text>
                    </atomic-field-condition>
                  </atomic-result-fields-list>
                </atomic-result-section-bottom-metadata>
              </template>
            </atomic-insight-result-template>
          </atomic-insight-result-list>
        </atomic-layout-section>
      </atomic-insight-layout>
    `,
    insightInterfaceDecorator,
  ],
  render: () =>
    html`<atomic-insight-result-attach-to-case-indicator></atomic-insight-result-attach-to-case-indicator>`,
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

    await step('Pre-attach the first result', async () => {
      const {attachResult} = loadAttachedResultsActions(engine);
      engine.dispatch(
        attachResult({
          caseId: CASE_ID,
          title: 'Support Article 0: Troubleshooting Guide',
          resultUrl: 'https://support.example.com/article/0',
          permanentId: 'insight-perm-id-0',
          uriHash: 'insight-hash-0',
        })
      );
    });

    await step('Execute the first search', async () => {
      await insightInterface!.executeFirstSearch();
    });
  },
};
