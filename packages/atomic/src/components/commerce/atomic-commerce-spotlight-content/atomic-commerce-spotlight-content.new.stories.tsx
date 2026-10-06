import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {sampleSpotlightContents} from '@/storybook-utils/commerce/spotlight-content';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-spotlight-content/atomic-commerce-spotlight-content.js';

const interactiveSpotlightContent: InteractiveSpotlightContent = {
  select: () => {},
  beginDelayedSelect: () => {},
  cancelPendingSelect: () => {},
};

const buildSpotlightContent = (overrides: Partial<SpotlightContent> = {}): SpotlightContent => ({
  ...sampleSpotlightContents[0],
  position: 1,
  ...overrides,
});

const {argTypes} = getStorybookHelpers('atomic-commerce-spotlight-content', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-commerce-spotlight-content',
  title: 'Commerce/Spotlight Content',
  id: 'atomic-commerce-spotlight-content',
  parameters: {
    ...parameters,
    docs: {
      ...parameters.docs,
      description: {
        component:
          'Rendered by `atomic-commerce-product-list` for each Spotlight Content item when `enable-spotlight-content` is set on `atomic-commerce-interface`.',
      },
    },
  },
  args: {
    spotlightContent: buildSpotlightContent(),
    display: 'grid',
  },
  argTypes: {
    ...argTypes,
    display: {...argTypes.display, control: 'radio', options: ['grid', 'list']},
  },
  render: ({spotlightContent, display}) =>
    html`<div style="width: 300px">
      <atomic-commerce-spotlight-content
        .spotlightContent=${spotlightContent}
        .interactiveSpotlightContent=${interactiveSpotlightContent}
        .display=${display}
      ></atomic-commerce-spotlight-content>
    </div>`,
};

export default meta;

export const Default: Story = {};

export const WithCustomFontColors: Story = {
  name: 'With custom font colors',
  args: {
    spotlightContent: buildSpotlightContent({
      ...sampleSpotlightContents[1],
      nameFontColor: '#b91c1c',
      descriptionFontColor: '#7c3aed',
    }),
  },
};

export const ImageOnly: Story = {
  name: 'Image only',
  args: {
    spotlightContent: buildSpotlightContent({
      name: undefined,
      description: undefined,
    }),
  },
};
