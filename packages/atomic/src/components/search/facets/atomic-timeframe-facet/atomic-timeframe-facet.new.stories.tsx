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
  'atomic-timeframe-facet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-timeframe-facet',
  title: 'Search/TimeframeFacet',
  id: 'atomic-timeframe-facet',
  args: {
    ...args,
    'default-slot': `
    <atomic-timeframe unit="hour"></atomic-timeframe>
    <atomic-timeframe unit="day"></atomic-timeframe>
    <atomic-timeframe unit="week"></atomic-timeframe>
    <atomic-timeframe unit="month"></atomic-timeframe>
    <atomic-timeframe unit="quarter"></atomic-timeframe>
    <atomic-timeframe unit="year"></atomic-timeframe>
  `,
  },
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
};

export default meta;

export const Default: Story = {
  name: 'atomic-timeframe-facet',
};

export const WithDependsOn: Story = {
  name: 'atomic-timeframe-facet-with-depends-on',
  tags: ['test'],
  decorators: [withRegularFacet('before'), withBreadboxDecorator('before')],
  argTypes: {
    'depends-on-filetype': {
      name: 'depends-on-filetype',
      control: {type: 'text'},
    },
  },
  args: {
    label: 'Timeframe (Dependent facet)',
    'with-date-picker': true,
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
