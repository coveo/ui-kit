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
  component: 'atomic-insight-result-action',
  title: 'Insight/Result Action',
  id: 'atomic-insight-result-action',
  render: (args) => html`
    <atomic-result-section-actions id="code-root">
      <atomic-insight-result-action
        action=${args.action}
        tooltip=${args.tooltip}
        tooltip-on-click=${args.tooltipOnClick}
        icon=${args.icon}
      ></atomic-insight-result-action>
    </atomic-result-section-actions>
  `,
  args: {
    action: 'copyToClipboard',
    tooltip: 'Copy to clipboard',
    tooltipOnClick: 'Copied!',
    icon: '',
  },
  argTypes: {
    action: {
      control: 'select',
      options: [
        'copyToClipboard',
        'attachToCase',
        'quickview',
        'postToFeed',
        'sendAsEmail',
      ],
      description: 'The type of action to perform when clicked',
    },
    tooltip: {
      control: 'text',
      description: 'The text tooltip to show on the result action icon',
    },
    tooltipOnClick: {
      control: 'text',
      description: 'The text tooltip to show after clicking the button',
    },
    icon: {
      control: 'text',
      description:
        'Custom SVG icon to display. If not provided, uses a default icon based on the action type.',
    },
  },
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

export const CopyToClipboard: Story = {
  name: 'Copy to Clipboard',
  args: {
    action: 'copyToClipboard',
    tooltip: 'Copy link',
    tooltipOnClick: 'Copied!',
  },
};

export const AttachToCase: Story = {
  name: 'Attach to Case',
  args: {
    action: 'attachToCase',
    tooltip: 'Attach to case',
  },
};

export const Quickview: Story = {
  name: 'Quickview',
  args: {
    action: 'quickview',
    tooltip: 'Preview',
  },
};

export const PostToFeed: Story = {
  name: 'Post to Feed',
  args: {
    action: 'postToFeed',
    tooltip: 'Post to feed',
  },
};

export const SendAsEmail: Story = {
  name: 'Send as Email',
  args: {
    action: 'sendAsEmail',
    tooltip: 'Send as email',
  },
};

export const WithOtherActions: Story = {
  name: 'With Other Actions',
  render: () => html`
    <atomic-result-section-actions id="code-root">
      <atomic-insight-result-action
        action="copyToClipboard"
        tooltip="Copy"
        tooltip-on-click="Copied!"
      ></atomic-insight-result-action>
      <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
      <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
    </atomic-result-section-actions>
  `,
};
