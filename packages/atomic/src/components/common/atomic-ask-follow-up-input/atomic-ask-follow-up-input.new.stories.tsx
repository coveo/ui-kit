import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import i18next, {type i18n} from 'i18next';
import {userEvent} from 'storybook/test';
import enTranslations from '@/dist/lang/en.json';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import type {AtomicAskFollowUpInput} from './atomic-ask-follow-up-input';
import '@/src/components/common/atomic-ask-follow-up-input/atomic-ask-follow-up-input.js';

async function createI18n(): Promise<i18n> {
  const instance = i18next.createInstance();
  await instance.init({
    lng: 'en',
    resources: {en: {translation: enTranslations}},
  });
  return instance;
}

const meta: Meta = {
  component: 'atomic-ask-follow-up-input',
  title: 'Common/Ask Follow Up Input',
  id: 'atomic-ask-follow-up-input',
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
      'atomic-ask-follow-up-input'
    ) as AtomicAskFollowUpInput;
    element.i18n = i18nInstance;
    element.submitButtonDisabled = args.submitButtonDisabled as boolean;
    element.askFollowUp = args.askFollowUp as (query: string) => Promise<void>;

    wrapper.appendChild(element);
    return wrapper;
  },
  parameters: {
    ...parameters,
  },
  args: {
    submitButtonDisabled: false,
    askFollowUp: async () => {},
  },
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const SubmitButtonDisabled: Story = {
  name: 'Submit Button Disabled',
  args: {
    submitButtonDisabled: true,
  },
};

export const ExpandedWithText: Story = {
  name: 'Expanded With Text',
  play: async ({canvasElement}) => {
    await customElements.whenDefined('atomic-ask-follow-up-input');
    const element = canvasElement.querySelector('atomic-ask-follow-up-input');
    const textarea =
      element?.shadowRoot?.querySelector<HTMLTextAreaElement>('textarea');
    if (textarea) {
      await userEvent.type(
        textarea,
        'What else should I try?{Shift>}{Enter}{/Shift}Can you provide more details about this topic?{Shift>}{Enter}{/Shift}I would like to learn more about the alternatives.'
      );
    }
  },
};
