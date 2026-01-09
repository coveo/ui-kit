import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockedInsightApi = new MockInsightApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-smart-snippet-feedback-modal',
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
          ?.querySelector('atomic-insight-smart-snippet-feedback-modal');
        if (modal) {
          modal.isOpen = true;
        }
      }}
    >
      Open Feedback Modal
    </button>
    ${story()}
  </div>
`;

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-smart-snippet-feedback-modal',
  title: 'Insight/Smart Snippet Feedback Modal',
  id: 'atomic-insight-smart-snippet-feedback-modal',
  render: (args) => template(args),
  decorators: [openModalDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockedInsightApi.handlers],
    },
  },
  args: {
    ...args,
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
