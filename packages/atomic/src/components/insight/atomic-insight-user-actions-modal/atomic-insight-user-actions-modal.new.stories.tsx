import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {testDialogA11y} from '@/storybook-utils/a11y/dialog.js';
import {MockInsightApi} from '@coveo/platform-mock-api/insight/mock';
import {MockMachineLearningApi} from '@coveo/platform-mock-api/machinelearning/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import '@/src/components/insight/atomic-insight-user-actions-modal/atomic-insight-user-actions-modal.js';

const insightApiHarness = new MockInsightApi();
const machineLearningApiHarness = new MockMachineLearningApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-user-actions-modal',
  {excludeCategories: ['methods']}
);

const openModalDecorator: Decorator = (story) => html`
  <div>
    <button
      id="open-modal-btn"
      style="padding: 8px 16px; cursor: pointer;"
      @click=${(e: Event) => {
        const modal = (e.target as HTMLElement)
          .closest('div')
          ?.querySelector('atomic-insight-user-actions-modal');
        if (modal) {
          modal.isOpen = true;
        }
      }}
    >
      Open User Actions
    </button>
    ${story()}
  </div>
`;

const meta: Meta = {
  component: 'atomic-insight-user-actions-modal',
  title: 'Insight/User Actions Modal',
  id: 'atomic-insight-user-actions-modal',
  render: (args) => template(args),
  decorators: [openModalDecorator, decorator],
  parameters: {
    ...parameters,
    // TODO SFINT-6463: Fix a11y issues in the User Actions Timeline rendered inside this modal.
    a11y: {disable: true},
    actions: {
      handles: events,
    },
    docs: {
      ...parameters.docs,
      story: {
        ...parameters.docs?.story,
        height: '600px',
      },
    },
    msw: {
      handlers: [...insightApiHarness.handlers, ...machineLearningApiHarness.handlers],
    },
  },
  beforeEach: () => {
    insightApiHarness.searchEndpoint.clear();
    insightApiHarness.querySuggestEndpoint.clear();
  },
  args: {
    ...args,
    'user-id': 'exampleUserId',
    'ticket-creation-date-time': encodeURIComponent('2024-08-30'),
  },
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const OpenedModal: Story = {
  name: 'Modal Opened',
  args: {
    'is-open': true,
  },
};

export const A11yDialog: Story = {
  tags: ['a11y', 'test', '!dev'],
  name: 'A11y Dialog',
  args: {
    'is-open': true,
  },
  play: async (context) => {
    await play(context);
    await testDialogA11y(context, {triggerLabel: 'Open User Actions'});
  },
};
