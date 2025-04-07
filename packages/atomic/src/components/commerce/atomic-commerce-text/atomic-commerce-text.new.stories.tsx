import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {within} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {AtomicCommerceInterface} from '../atomic-commerce-interface/atomic-commerce-interface';

const {decorator, play} = wrapInCommerceInterface({skipFirstRequest: true});

const meta: Meta = {
  component: 'atomic-commerce-text',
  title: 'Atomic-Commerce/Product Template Components/Text',
  id: 'atomic-commerce-text',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-text',
  args: {
    'attributes-value': 'Atomic Commerce Text',
  },
};

export const WithTranslations: Story = {
  name: 'With translations',
  play: async (context) => {
    await play(context);
    const canvas = within(context.canvasElement);
    const commerceInterface =
      await canvas.findByTestId<AtomicCommerceInterface>('root-interface');

    await context.step('Load translations', () => {
      commerceInterface.i18n.addResourceBundle('en', 'translation', {
        // "translation-key": "A single product"
        [context.args['attributes-value']]: context.args.translationValue,
        // "translation-key_other": "{{count}} products"
        [context.args['attributes-value'] + '_other']:
          context.args.translationValueOther,
      });
    });
  },
  args: {
    'attributes-value': 'translation-key',
    'attributes-count': 1,
    translationValue: 'A single product',
    translationValueOther: '{{count}} products',
  },
};
