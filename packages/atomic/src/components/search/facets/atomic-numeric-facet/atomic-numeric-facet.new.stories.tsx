import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

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
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
  },
  argTypes,
  beforeEach: () => {
    mockSearchApi.searchEndpoint.mock((response) => ({
      ...response,
      facets: [
        {
          facetId: 'ytviewcount_input_range',
          field: 'ytviewcount',
          moreValuesAvailable: false,
          values: [
            {
              start: 0,
              end: 71000000,
              endInclusive: true,
              state: 'idle',
              numberOfResults: 62195,
            },
          ],
          indexScore: 0.899164093461275,
          domain: {
            start: 0,
            end: 70199117,
          },
        },
        {
          facetId: 'ytviewcount',
          field: 'ytviewcount',
          moreValuesAvailable: false,
          values: [
            {
              start: 0,
              end: 880000,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 58830,
            },
            {
              start: 880000,
              end: 1760000,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 1959,
            },
            {
              start: 1760000,
              end: 2640000,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 641,
            },
            {
              start: 2640000,
              end: 3520000,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 321,
            },
            {
              start: 3520000,
              end: 4400000,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 169,
            },
            {
              start: 4400000,
              end: 6160000,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 98,
            },
            {
              start: 6160000,
              end: 11440000,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 110,
            },
            {
              start: 11440000,
              end: 70400000,
              endInclusive: true,
              state: 'idle',
              numberOfResults: 67,
            },
          ],
          indexScore: 0.899164093461275,
          domain: {
            start: 0,
            end: 70199117,
          },
        },
        {
          facetId: 'ytviewcount_input',
          field: 'ytviewcount',
          moreValuesAvailable: false,
          values: [],
          indexScore: 0.899164093461275,
          domain: {
            start: 0,
            end: 70199117,
          },
        },
        {
          facetId: 'filetype',
          field: 'filetype',
          moreValuesAvailable: true,
          values: [
            {
              value: 'YouTubeVideo',
              state: 'selected',
              numberOfResults: 62195,
            },
            {
              value: 'dynamicscrmitem',
              state: 'idle',
              numberOfResults: 184232,
            },
            {
              value: 'lithiumuser',
              state: 'idle',
              numberOfResults: 126741,
            },
            {
              value: 'txt',
              state: 'idle',
              numberOfResults: 38398,
            },
            {
              value: 'lithiummessage',
              state: 'idle',
              numberOfResults: 26859,
            },
            {
              value: 'incident',
              state: 'idle',
              numberOfResults: 7262,
            },
            {
              value: 'lithiumthread',
              state: 'idle',
              numberOfResults: 7111,
            },
            {
              value: 'sn_hr_core_case',
              state: 'idle',
              numberOfResults: 1192,
            },
          ],
          indexScore: 0.10000043697412896,
        },
      ],
    }));
  },
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
