import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();

const mockUserActions = [
  {
    actionType: 'SEARCH' as const,
    query: 'how to reset password',
    timestamp: 1704067200000,
    searchHub: 'CustomerService',
  },
  {
    actionType: 'CLICK' as const,
    timestamp: 1704067260000,
    searchHub: 'CustomerService',
    document: {
      title: 'Password Reset Guide',
      contentIdValue: 'https://example.com/password-reset',
    },
  },
  {
    actionType: 'VIEW' as const,
    timestamp: 1704067320000,
    searchHub: 'CustomerService',
    document: {
      title: 'Account Security Best Practices',
      contentIdValue: 'https://example.com/security',
    },
  },
];

const mockUserActionsWithCaseCreation = [
  {
    actionType: 'SEARCH' as const,
    query: 'login issues',
    timestamp: 1704063600000,
    searchHub: 'CustomerService',
  },
  {
    actionType: 'CLICK' as const,
    timestamp: 1704065400000,
    searchHub: 'CustomerService',
    document: {
      title: 'Troubleshooting Login',
      contentIdValue: 'https://example.com/login-help',
    },
  },
  {
    actionType: 'TICKET_CREATION' as const,
    timestamp: 1704067200000,
    searchHub: 'CustomerService',
  },
  {
    actionType: 'SEARCH' as const,
    query: 'account locked',
    timestamp: 1704067800000,
    searchHub: 'CustomerService',
  },
  {
    actionType: 'VIEW' as const,
    timestamp: 1704068400000,
    searchHub: 'CustomerService',
    document: {
      title: 'Account Lock FAQ',
      contentIdValue: 'https://example.com/account-locked',
    },
  },
];

const meta: Meta = {
  component: 'atomic-insight-user-actions-session',
  title: 'Insight/User Actions Session',
  id: 'atomic-insight-user-actions-session',
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'Regular session',
  render: () => html`
    <atomic-insight-user-actions-session
      .startTimestamp=${1704067200000}
      .userActions=${mockUserActions}
    ></atomic-insight-user-actions-session>
  `,
};

export const CaseCreationSession: Story = {
  name: 'Case creation session',
  render: () => html`
    <atomic-insight-user-actions-session
      .startTimestamp=${1704063600000}
      .userActions=${mockUserActionsWithCaseCreation}
    ></atomic-insight-user-actions-session>
  `,
};

export const EmptySession: Story = {
  name: 'Empty session',
  render: () => html`
    <atomic-insight-user-actions-session
      .startTimestamp=${1704067200000}
      .userActions=${[]}
    ></atomic-insight-user-actions-session>
  `,
};

export const SingleAction: Story = {
  name: 'Single action',
  render: () => html`
    <atomic-insight-user-actions-session
      .startTimestamp=${1704067200000}
      .userActions=${[mockUserActions[0]]}
    ></atomic-insight-user-actions-session>
  `,
};
