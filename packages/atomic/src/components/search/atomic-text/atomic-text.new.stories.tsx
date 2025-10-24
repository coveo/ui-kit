import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {AtomicSearchInterface} from '../atomic-search-interface/atomic-search-interface';

const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: true,
});
const {events, args, argTypes, template} = getStorybookHelpers('atomic-text', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-text',
  title: 'Search/Text',
  id: 'atomic-text',
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
    value: 'Atomic Text',
  },
};

export const WithTranslations: Story = {
  name: 'With translations',
  play: async (context) => {
    const searchInterface =
      context.canvasElement.querySelector<AtomicSearchInterface>(
        'atomic-search-interface'
      )!;

    await context.step('Load translations', async () => {
      await customElements.whenDefined('atomic-search-interface');
      searchInterface.i18n.addResourceBundle('en', 'translation', {
        // "translation-key": "A single result"
        [context.args.value]: context.args.translationValue,
        // "translation-key_other": "{{count}} results"
        [`${context.args.value}_other`]: context.args.translationValueOther,
      });
    });
    await play(context);
  },
  args: {
    value: 'translation-key',
    count: 1,
    translationValue: 'A single result',
    translationValueOther: '{{count}} results',
  },
};
