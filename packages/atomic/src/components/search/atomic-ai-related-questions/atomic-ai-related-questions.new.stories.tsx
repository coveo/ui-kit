import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {
  AtomicAiRelatedQuestions,
  RelatedQuestion,
} from './atomic-ai-related-questions';
import './atomic-ai-related-questions';

const sampleQuestions: RelatedQuestion[] = [
  {
    id: '1',
    question: 'What is a query pipeline?',
  },
  {
    id: '2',
    question: 'What is Coveo Relevance Index?',
  },
  {
    id: '3',
    question: 'What is a query?',
  },
];

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-ai-related-questions',
  title: 'Search/AI Related Questions',
  id: 'atomic-ai-related-questions',

  render: (args) => {
    const element = document.createElement(
      'atomic-ai-related-questions'
    ) as AtomicAiRelatedQuestions;
    element.questions = args.questions || sampleQuestions;
    element.answerConfigurationId =
      args.answerConfigurationId || 'fc581be0-6e61-4039-ab26-a3f2f52f308f';
    return element;
  },
  decorators: [decorator, (story) => html`${story()}`],
  parameters: {
    ...parameters,
  },
  args: {
    questions: sampleQuestions,
    answerConfigurationId: 'fc581be0-6e61-4039-ab26-a3f2f52f308f',
  },
  argTypes: {
    questions: {
      control: {type: 'object'},
      description: 'Array of related questions to display',
    },
    answerConfigurationId: {
      control: {type: 'text'},
      description: 'The answer configuration ID for AI conversations',
    },
  },
  play: async (storyContext) => {
    await play(storyContext);
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
};
