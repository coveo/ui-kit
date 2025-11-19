import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import './atomic-citation-container.js';
import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {AtomicCitationContainer} from './atomic-citation-container.js';

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
  component: 'atomic-citation-container',
  title: 'Common/Citation Container',
  id: 'atomic-citation-container',

  render: (args) => {
    const element = document.createElement(
      'atomic-citation-container'
    ) as AtomicCitationContainer;
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
  name: 'atomic-citation-container',
  decorators: [(story) => html`${story()}`],
};
