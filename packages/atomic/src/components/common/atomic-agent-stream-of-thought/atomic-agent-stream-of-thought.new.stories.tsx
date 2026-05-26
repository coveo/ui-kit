import type {GenerationStep} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import i18next, {type i18n} from 'i18next';
import {userEvent} from 'storybook/test';
import enTranslations from '@/dist/lang/en.json';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import type {AtomicAgentStreamOfThought} from './atomic-agent-stream-of-thought';
import '@/src/components/common/atomic-agent-stream-of-thought/atomic-agent-stream-of-thought.js';

async function createI18n(): Promise<i18n> {
  const instance = i18next.createInstance();
  await instance.init({
    lng: 'en',
    resources: {en: {translation: enTranslations}},
  });
  return instance;
}

const meta: Meta = {
  component: 'atomic-agent-stream-of-thought',
  title: 'Common/Agent Stream Of Thought',
  id: 'atomic-agent-stream-of-thought',
  loaders: [
    async (): Promise<{i18n: i18n}> => ({
      i18n: await createI18n(),
    }),
  ],
  render: (args, context) => {
    const {i18n: i18nInstance} = context.loaded as {i18n: i18n};
    const element = document.createElement(
      'atomic-agent-stream-of-thought'
    ) as AtomicAgentStreamOfThought;
    element.i18n = i18nInstance;
    element.agentSteps = args.agentSteps as GenerationStep[];
    element.isStreaming = args.isStreaming as boolean;
    return element;
  },
  parameters: {
    ...parameters,
  },
  args: {
    agentSteps: [] as GenerationStep[],
    isStreaming: false,
  },
};

export default meta;

const fullSequenceSteps: GenerationStep[] = [
  {name: 'thinking', status: 'completed', startedAt: 0, finishedAt: 100},
  {name: 'searching', status: 'completed', startedAt: 100, finishedAt: 200},
  {name: 'thinking', status: 'completed', startedAt: 200, finishedAt: 300},
  {name: 'answering', status: 'completed', startedAt: 300, finishedAt: 400},
];

export const ThinkingBeforeSearch: Story = {
  name: 'Thinking before search',
  args: {
    agentSteps: [
      {name: 'thinking', status: 'active', startedAt: Date.now()},
    ] as GenerationStep[],
    isStreaming: true,
  },
};

export const Searching: Story = {
  name: 'Searching',
  args: {
    agentSteps: [
      {name: 'thinking', status: 'completed', startedAt: 0, finishedAt: 100},
      {name: 'searching', status: 'active', startedAt: Date.now()},
    ] as GenerationStep[],
    isStreaming: true,
  },
};

export const ThinkingAfterSearch: Story = {
  name: 'Thinking after search',
  args: {
    agentSteps: [
      {name: 'thinking', status: 'completed', startedAt: 0, finishedAt: 100},
      {name: 'searching', status: 'completed', startedAt: 100, finishedAt: 200},
      {name: 'thinking', status: 'active', startedAt: Date.now()},
    ] as GenerationStep[],
    isStreaming: true,
  },
};

export const Answering: Story = {
  name: 'Answering',
  args: {
    agentSteps: [
      {name: 'thinking', status: 'completed', startedAt: 0, finishedAt: 100},
      {name: 'searching', status: 'completed', startedAt: 100, finishedAt: 200},
      {name: 'thinking', status: 'completed', startedAt: 200, finishedAt: 300},
      {name: 'answering', status: 'active', startedAt: Date.now()},
    ] as GenerationStep[],
    isStreaming: true,
  },
};

export const CompleteCollapsed: Story = {
  name: 'Complete - collapsed',
  args: {
    agentSteps: fullSequenceSteps,
    isStreaming: false,
  },
};

export const CompleteExpanded: Story = {
  name: 'Complete - expanded',
  args: {
    agentSteps: fullSequenceSteps,
    isStreaming: false,
  },
  play: async ({canvasElement}) => {
    await customElements.whenDefined('atomic-agent-stream-of-thought');
    const el = canvasElement.querySelector('atomic-agent-stream-of-thought');
    const button = el?.shadowRoot?.querySelector<HTMLButtonElement>(
      '.collapsed-timeline-summary'
    );
    if (button) {
      await userEvent.click(button);
    }
  },
};
