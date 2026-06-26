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
