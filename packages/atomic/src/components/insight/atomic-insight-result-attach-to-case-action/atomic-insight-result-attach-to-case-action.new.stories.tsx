import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import {wrapInInsightLayout} from '@/storybook-utils/insight/insight-layout-wrapper';
import {wrapInInsightResultList} from '@/storybook-utils/insight/insight-result-list-wrapper';
import {wrapInInsightResultTemplate} from '@/storybook-utils/insight/insight-result-template-wrapper';

const insightApiHarness = new MockInsightApi();

const {decorator: insightInterfaceDecorator, play} = wrapInInsightInterface(
  {},
  false,
  false
);
const {decorator: insightLayoutDecorator} = wrapInInsightLayout(false);
const {decorator: insightResultListDecorator} = wrapInInsightResultList(
  'list',
  false
);
const {decorator: insightResultTemplateDecorator} =
  wrapInInsightResultTemplate(false);

const meta: Meta = {
  component: 'atomic-insight-result-attach-to-case-action',
  title: 'Insight/Result Attach To Case Action',
  id: 'atomic-insight-result-attach-to-case-action',
  render: () => html`
    <atomic-result-section-actions id="code-root">
      <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
    </atomic-result-section-actions>
  `,
  decorators: [
    (story) => html`
      <atomic-result-section-title>
        <atomic-result-link></atomic-result-link>
      </atomic-result-section-title>
      <atomic-result-section-excerpt>
        <atomic-result-text field="excerpt"></atomic-result-text>
      </atomic-result-section-excerpt>
      ${story()}
    `,
    insightResultTemplateDecorator,
    insightResultListDecorator,
    insightLayoutDecorator,
    insightInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  play,
};

export default meta;

export const Default: Story = {};

export const WithOtherActions: Story = {
  name: 'With Other Actions',
  render: () => html`
    <atomic-result-section-actions id="code-root">
      <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
      <atomic-insight-result-action
        action="copyToClipboard"
        tooltip="Copy"
      ></atomic-insight-result-action>
      <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
    </atomic-result-section-actions>
  `,
};
