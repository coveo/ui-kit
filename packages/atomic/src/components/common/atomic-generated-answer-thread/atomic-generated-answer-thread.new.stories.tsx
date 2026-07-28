import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import i18next, {type i18n} from 'i18next';
import {within} from 'shadow-dom-testing-library';
import {userEvent, waitFor} from 'storybook/test';
import enTranslations from '@/dist/lang/en.json';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import type {GeneratedAnswer} from '@/src/components/common/atomic-generated-answer-content/atomic-generated-answer-content';
import type {AtomicGeneratedAnswerThread} from './atomic-generated-answer-thread';
import '@/src/components/common/atomic-generated-answer-thread/atomic-generated-answer-thread.js';

async function createI18n(): Promise<i18n> {
  const instance = i18next.createInstance();
  await instance.init({
    lng: 'en',
    resources: {en: {translation: enTranslations}},
  });
  return instance;
}

function createGeneratedAnswer(
  overrides: Partial<GeneratedAnswer> & {question: string}
): GeneratedAnswer {
  return {
    isLoading: false,
    isStreaming: false,
    answer: 'This is a generated answer with relevant information.',
    answerContentFormat: 'text/markdown',
    citations: [],
    cannotAnswer: false,
    liked: false,
    disliked: false,
    feedbackSubmitted: false,
    generationSteps: [],
    answerId: crypto.randomUUID(),
    ...overrides,
  };
}

const meta: Meta = {
  component: 'atomic-generated-answer-thread',
  title: 'Common/Generated Answer Thread',
  id: 'atomic-generated-answer-thread',
  loaders: [
    async (): Promise<{i18n: i18n}> => ({
      i18n: await createI18n(),
    }),
  ],
  render: (args, context) => {
    const {i18n: i18nInstance} = context.loaded as {i18n: i18n};
    const element = document.createElement(
      'atomic-generated-answer-thread'
    ) as AtomicGeneratedAnswerThread;
    element.i18n = i18nInstance;
    element.generatedAnswers = args.generatedAnswers as GeneratedAnswer[];
    return element;
  },
  parameters: {
    ...parameters,
  },
  args: {
    generatedAnswers: [] as GeneratedAnswer[],
  },
};

export default meta;

export const SingleAnswer: Story = {
  name: 'Single Answer',
  args: {
    generatedAnswers: [
      createGeneratedAnswer({
        question: 'How do I reset my password?',
        answer:
          'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your inbox.',
      }),
    ],
  },
};

export const TwoAnswers: Story = {
  name: 'Two Answers',
  args: {
    generatedAnswers: [
      createGeneratedAnswer({
        question: 'How do I reset my password?',
        answer:
          'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your inbox.',
      }),
      createGeneratedAnswer({
        question: 'What if I never received the reset email?',
        answer:
          'If you did not receive the reset email, check your spam folder. You can also try again after a few minutes or contact support for assistance.',
      }),
    ],
  },
};

export const MultipleAnswersCollapsed: Story = {
  name: 'Multiple Answers - Collapsed',
  args: {
    generatedAnswers: [
      createGeneratedAnswer({
        question: 'How do I reset my password?',
        answer:
          'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your inbox.',
      }),
      createGeneratedAnswer({
        question: 'What if I never received the reset email?',
        answer:
          'If you did not receive the reset email, check your spam folder. You can also try again after a few minutes or contact support for assistance.',
      }),
      createGeneratedAnswer({
        question: 'Can I change my email address on my account?',
        answer:
          'Yes, you can change your email address from your account settings page. Navigate to Profile > Email and enter your new email address.',
      }),
    ],
  },
};

export const MultipleAnswersExpanded: Story = {
  name: 'Multiple Answers - Expanded',
  args: {
    generatedAnswers: [
      createGeneratedAnswer({
        question: 'How do I reset my password?',
        answer:
          'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your inbox.',
      }),
      createGeneratedAnswer({
        question: 'What if I never received the reset email?',
        answer:
          'If you did not receive the reset email, check your spam folder. You can also try again after a few minutes or contact support for assistance.',
      }),
      createGeneratedAnswer({
        question: 'Can I change my email address on my account?',
        answer:
          'Yes, you can change your email address from your account settings page. Navigate to Profile > Email and enter your new email address.',
      }),
    ],
  },
  play: async ({canvasElement}) => {
    await customElements.whenDefined('atomic-generated-answer-thread');
    const canvas = within(canvasElement);
    let button!: HTMLElement;
    await waitFor(async () => {
      button = await canvas.findByShadowText(/show .* previous/i);
    });
    await userEvent.click(button);
  },
};

export const MultiLineAnswers: Story = {
  name: 'Multi-Line Answers',
  args: {
    generatedAnswers: [
      createGeneratedAnswer({
        question:
          'What are the detailed steps I should follow to troubleshoot connectivity issues when my application fails to establish a secure connection to the remote server after upgrading the SDK?',
        answer:
          'Start by verifying that the SSL certificates are valid and not expired. Then check if the server endpoint URL has changed in the new SDK version. Review the migration guide for any breaking changes in the connection configuration.',
      }),
      createGeneratedAnswer({
        question:
          'Can you explain how to configure the retry policy and timeout settings for the HTTP client when dealing with intermittent network failures in a distributed microservices architecture?',
        answer:
          'Configure exponential backoff with a base delay of 500ms and a maximum of 3 retries. Set the connection timeout to 10 seconds and the read timeout to 30 seconds. Use a circuit breaker pattern to prevent cascading failures across services.',
      }),
      createGeneratedAnswer({
        question:
          'How do I set up comprehensive logging and monitoring for authentication failures so that the security team can detect and respond to potential brute force attacks in real time?',
        answer:
          'Enable audit logging for all authentication events. Configure alerts for more than 5 failed attempts within a 10-minute window from the same IP address. Integrate with your SIEM solution and set up real-time dashboards to visualize login patterns.',
      }),
    ],
  },
  decorators: [
    (story) => {
      const container = document.createElement('div');
      container.style.maxWidth = '400px';
      container.appendChild(story() as Node);
      return container;
    },
  ],
  play: async ({canvasElement}) => {
    await customElements.whenDefined('atomic-generated-answer-thread');
    const canvas = within(canvasElement);
    let button!: HTMLElement;
    await waitFor(async () => {
      button = await canvas.findByShadowText(/show .* previous/i);
    });
    await userEvent.click(button);
  },
};
