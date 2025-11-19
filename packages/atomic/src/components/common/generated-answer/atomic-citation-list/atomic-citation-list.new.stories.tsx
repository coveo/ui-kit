import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import type {
  AtomicCitationList,
  GeneratedAnswerCitation,
} from './atomic-citation-list';
import './atomic-citation-list';

const sampleCitations: GeneratedAnswerCitation[] = [
  {
    id: '1',
    title: "What's a query pipeline? | Coveo Platform",
    uri: 'https://docs.coveo.com/en/query-pipeline',
    permanentid: 'doc-query-pipeline-123',
    source: 'Coveo Documentation',
    clickUri: 'https://docs.coveo.com/en/query-pipeline',
  },
  {
    id: '2',
    title:
      'Manage the basic configuration of a query pipeline | Coveo Platform',
    uri: 'https://docs.coveo.com/en/manage-query-pipeline',
    permanentid: 'doc-manage-pipeline-456',
    source: 'Coveo Training',
    clickUri: 'https://docs.coveo.com/en/manage-query-pipeline',
  },
];

const meta: Meta = {
  component: 'atomic-citation-list',
  title: 'Common/Citation List',
  id: 'atomic-citation-list',

  render: (args) => {
    const element = document.createElement(
      'atomic-citation-list'
    ) as AtomicCitationList;
    element.citations = args.citations;
    return element;
  },
  parameters: {
    ...parameters,
  },
  args: {
    citations: sampleCitations,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-citation-list',
  decorators: [(story) => html`${story()}`],
};

export const WithCustomCitations: Story = {
  name: 'Custom Citations',
  args: {
    citations: [
      {
        id: 'custom-1',
        title: 'Custom Citation Title',
        uri: 'https://example.com/citation1',
        permanentid: 'custom-citation-1',
        source: 'Example Source',
      },
    ],
  },
  decorators: [(story) => html`${story()}`],
};
