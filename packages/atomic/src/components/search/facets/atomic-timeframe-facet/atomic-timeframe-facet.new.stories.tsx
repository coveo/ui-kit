import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';

const {decorator, play} = wrapInSearchInterface({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.aq = '@filetype==("YouTubeVideo")';
    r.body = JSON.stringify(parsed);
    return r;
  },
});

const meta: Meta = {
  component: 'atomic-timeframe-facet',
  title: 'Atomic/TimeframeFacet',
  id: 'atomic-timeframe-facet',
  argTypes: {
    'attributes-min': {
      name: 'min',
      type: 'string',
    },
    'attributes-max': {
      name: 'max',
      type: 'string',
    },
  },
  args: {
    'slots-default': `
    <atomic-timeframe unit="hour"></atomic-timeframe>
    <atomic-timeframe unit="day"></atomic-timeframe>
    <atomic-timeframe unit="week"></atomic-timeframe>
    <atomic-timeframe unit="month"></atomic-timeframe>
    <atomic-timeframe unit="quarter"></atomic-timeframe>
    <atomic-timeframe unit="year"></atomic-timeframe>
  `,
  },
  render: renderComponent,
  decorators: [decorator],
  parameters,
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
    'attributes-depends-on-filetype': {
      name: 'depends-on-filetype',
      control: {type: 'text'},
    },
  },
  args: {
    'attributes-label': 'Timeframe (Dependent facet)',
    'attributes-with-date-picker': true,
    'attributes-depends-on-filetype': 'YouTubeVideo',
  },
  play: async (context) => {
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);
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
