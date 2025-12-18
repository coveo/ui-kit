import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockedSearchApi = new MockSearchApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-smart-snippet-feedback-modal',
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
          ?.querySelector('atomic-smart-snippet-feedback-modal');
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

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-smart-snippet-feedback-modal',
  title: 'Search/Smart Snippet Feedback Modal',
  id: 'atomic-smart-snippet-feedback-modal',
  render: (args) => template(args),
  decorators: [openModalDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockedSearchApi.handlers],
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
