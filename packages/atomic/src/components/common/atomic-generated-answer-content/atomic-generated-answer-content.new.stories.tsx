import type {
  GeneratedAnswerCitation,
  InteractiveCitation,
} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import i18next, {type i18n} from 'i18next';
import {html} from 'lit';
import enTranslations from '@/dist/lang/en.json';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {
  AtomicGeneratedAnswerContent,
  GeneratedAnswer,
} from './atomic-generated-answer-content';
import '@/src/components/common/atomic-generated-answer-content/atomic-generated-answer-content.js';
import '@/src/components/common/atomic-citation/atomic-citation.js';

const {decorator, play} = wrapInSearchInterface({skipFirstSearch: true});

async function createI18n(): Promise<i18n> {
  const instance = i18next.createInstance();
  await instance.init({
    lng: 'en',
    resources: {en: {translation: enTranslations}},
  });
  return instance;
}

function createGeneratedAnswer(
  overrides: Partial<GeneratedAnswer>
): GeneratedAnswer {
  return {
    question: 'How do I reset my password?',
    isLoading: false,
    isStreaming: false,
    answer:
      'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your inbox.',
    answerContentFormat: 'text/markdown',
    citations: sampleCitations,
    cannotAnswer: false,
    liked: false,
    disliked: false,
    feedbackSubmitted: false,
    generationSteps: [],
    answerId: crypto.randomUUID(),
    ...overrides,
  };
}

const sampleCitations: GeneratedAnswerCitation[] = [
  {
    id: 'citation-1',
    title: 'How to reset your password',
    uri: 'https://example.com/reset-password',
    permanentid: 'permanent-1',
    clickUri: 'https://example.com/reset-password',
    source: 'Help Center',
    text: 'To reset your password, click on "Forgot Password" on the login page.',
  },
  {
    id: 'citation-2',
    title: 'Account security best practices',
    uri: 'https://example.com/security',
    permanentid: 'permanent-2',
    clickUri: 'https://example.com/security',
    source: 'Help Center',
    text: 'Use a strong, unique password and change it regularly to keep your account secure.',
  },
];

const renderCitations = (citations: GeneratedAnswerCitation[]) =>
  html`${citations.map(
    (citation, index) =>
      html`<li class="max-w-full">
        <atomic-citation
          .citation=${citation}
          .index=${index}
          .sendHoverEndEvent=${() => {}}
          .interactiveCitation=${{
            select: () => {},
            beginDelayedSelect: () => {},
            cancelPendingSelect: () => {},
          } as InteractiveCitation}
        ></atomic-citation>
      </li>`
  )}`;

const meta: Meta = {
  component: 'atomic-generated-answer-content',
  title: 'Common/Generated Answer Content',
  id: 'atomic-generated-answer-content',
  decorators: [decorator],
  play,
  loaders: [
    async (): Promise<{i18n: i18n}> => ({
      i18n: await createI18n(),
    }),
  ],
  render: (args, context) => {
    const {i18n: i18nInstance} = context.loaded as {i18n: i18n};
    const wrapper = document.createElement('div');
    wrapper.style.width = '90vw';
    wrapper.style.maxWidth = '600px';

    const element = document.createElement(
      'atomic-generated-answer-content'
    ) as AtomicGeneratedAnswerContent;
    element.i18n = i18nInstance;
    element.generatedAnswer = args.generatedAnswer as GeneratedAnswer;
    element.renderCitations = args.renderCitations as typeof renderCitations;
    wrapper.appendChild(element);
    return wrapper;
  },
  parameters: {
    ...parameters,
  },
  args: {
    generatedAnswer: createGeneratedAnswer({}),
    renderCitations,
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const Markdown: Story = {
  name: 'Markdown',
  args: {
    generatedAnswer: createGeneratedAnswer({
      question: 'How do I configure the search page?',
      answerContentFormat: 'text/markdown',
      answer: [
        '## Configuration Steps',
        '',
        'Follow these steps to configure your search page:',
        '',
        '1. Open the **Admin Console**',
        '2. Navigate to *Search Pages*',
        '3. Click `Create New Page`',
        '',
        '> **Note:** You need administrator privileges to perform these actions.',
        '',
        '```json',
        '{',
        '  "searchPage": {',
        '    "name": "My Search Page",',
        '    "enabled": true',
        '  }',
        '}',
        '```',
      ].join('\n'),
    }),
  },
};

export const Streaming: Story = {
  name: 'Streaming',
  args: {
    generatedAnswer: createGeneratedAnswer({
      answer: [
        '## Configuration Steps',
        '',
        'Follow these steps to configure your search page:',
        '',
        '1. Open the **Admin Console**',
      ].join('\n'),
      isStreaming: true,
      citations: undefined,
    }),
  },
};

export const Liked: Story = {
  name: 'Liked',
  args: {
    generatedAnswer: createGeneratedAnswer({
      liked: true,
    }),
  },
};

export const Disliked: Story = {
  name: 'Disliked',
  args: {
    generatedAnswer: createGeneratedAnswer({
      disliked: true,
    }),
  },
};

export const Error: Story = {
  name: 'Error',
  args: {
    generatedAnswer: createGeneratedAnswer({
      error: {
        message: 'Something went wrong',
        code: 500,
      },
    }),
  },
};

export const TurnLimitError: Story = {
  name: 'Turn Limit Error',
  args: {
    generatedAnswer: createGeneratedAnswer({
      error: {
        message: 'Turn limit reached',
        isSseTurnLimitReachedError: () => true,
      },
    }),
  },
};

export const CannotAnswer: Story = {
  name: 'Cannot Answer',
  args: {
    generatedAnswer: createGeneratedAnswer({
      cannotAnswer: true,
    }),
  },
};
