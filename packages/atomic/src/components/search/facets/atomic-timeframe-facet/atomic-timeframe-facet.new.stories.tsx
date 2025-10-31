import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-timeframe-facet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface({
  config: {
    preprocessRequest: (r) => {
      const parsed = JSON.parse(r.body as string);
      parsed.aq = '@filetype==("YouTubeVideo")';
      r.body = JSON.stringify(parsed);
      return r;
    },
  },
});

const commerceFacetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px;">${story()}</div> `;

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
  decorators: [commerceFacetWidthDecorator, decorator],
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
  decorators: [facetDecorator],
};

export const WithDependsOn: Story = {
  name: 'atomic-timeframe-facet-with-depends-on',
  tags: ['test'],
  decorators: [
    (story, context) =>
      html`<style>
          ${context.componentId},
          atomic-facet {
            max-width: 500px;
            margin: auto;
          }
        </style>
        <atomic-breadbox data-testid="breadbox"></atomic-breadbox>
        ${story({})}
        <atomic-facet
          data-testid="parent-facet"
          field="filetype"
          label="File Type (Parent facet)"
        ></atomic-facet>`,
  ],
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
    const {canvas, step} = context;
    await play(context);
    await step('Select YouTubeVideo in filetype facet', async () => {
      const button = await canvas.findByShadowLabelText(
        'Inclusion filter on YouTubeVideo',
        {exact: false}
      );
      button.ariaChecked === 'false' ? button.click() : null;
    });
  },
};
