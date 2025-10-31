import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-numeric-facet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.aq = '@filetype==("YouTubeVideo")';
    r.body = JSON.stringify(parsed);
    return r;
  },
});

const meta: Meta = {
  component: 'atomic-numeric-facet',
  title: 'Search/NumericFacet',
  id: 'atomic-numeric-facet',
  render: (args) => template(args),
  decorators: [decorator],
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
  args: {
    label: 'YouTube View Count (Dependent facet)',
    field: 'ytviewcount',
    'with-input': 'integer',
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
