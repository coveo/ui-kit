import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  facetDecorator,
  withBreadboxDecorator,
  withFacetContainer,
  withRegularFacet,
} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-numeric-facet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-numeric-facet',
  title: 'Search/NumericFacet',
  id: 'atomic-numeric-facet',
  render: (args) => template(args),
  decorators: [facetDecorator, withFacetContainer, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,
  play,
  args: {
    ...args,
    'number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-numeric-facet',
  decorators: [facetDecorator],
  args: {
    field: 'ytviewcount',
  },
};

export const WithDependsOn: Story = {
  name: 'atomic-numeric-facet-with-depends-on',
  tags: ['test'],
  decorators: [withRegularFacet('before'), withBreadboxDecorator('before')],
  args: {
    label: 'YouTube View Count (Dependent facet)',
    field: 'ytviewcount',
    'with-input': 'integer',
    'depends-on-filetype': 'YouTubeVideo',
  },
  play: async (context) => {
    //TODO: Fix component registration race condition #6480
    await customElements.whenDefined('atomic-facet');
    await play(context);
    const {canvas, step} = context;
    await step('Select YouTubeVideo in filetype facet', async () => {
      const button = await canvas.findByShadowLabelText(
        'Inclusion filter on YouTubeVideo',
        {exact: false}
      );
      button.ariaChecked === 'false' ? button.click() : null;
    });
  },
};
