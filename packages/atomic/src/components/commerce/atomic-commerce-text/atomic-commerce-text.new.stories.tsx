import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import type {AtomicCommerceInterface} from '../atomic-commerce-interface/atomic-commerce-interface';

const {decorator, play} = wrapInCommerceInterface({
  skipFirstRequest: true,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-text',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-text',
  title: 'Commerce/Text',
  id: 'atomic-commerce-text',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  args: {
    value: 'Atomic Commerce Text',
  },
};

export const WithTranslations: Story = {
  name: 'With translations',
  play: async (context) => {
    const commerceInterface =
      context.canvasElement.querySelector<AtomicCommerceInterface>(
        'atomic-commerce-interface'
      )!;

    await context.step('Load translations', async () => {
      await customElements.whenDefined('atomic-commerce-interface');
      commerceInterface.i18n.addResourceBundle('en', 'translation', {
        // "translation-key": "A single product"
        [context.args.value]: context.args.translationValue,
        // "translation-key_other": "{{count}} products"
        [`${context.args.value}_other`]: context.args.translationValueOther,
      });
    });
    await play(context);
  },
  args: {
    value: 'translation-key',
    count: 1,
    translationValue: 'A single product',
    translationValueOther: '{{count}} products',
  },
};
