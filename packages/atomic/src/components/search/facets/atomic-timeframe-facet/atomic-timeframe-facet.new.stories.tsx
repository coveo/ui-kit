import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-timeframe-facet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface();

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
          facetId: 'filetype',
          field: 'filetype',
          moreValuesAvailable: false,
          values: [
            {
              value: 'YouTubeVideo',
              state: 'selected',
              numberOfResults: 62195,
            },
          ],
          indexScore: 0.10000043697412896,
        },
        {
          facetId: 'date',
          field: 'date',
          moreValuesAvailable: false,
          values: [
            {
              start: '2025/11/04@23:28:32',
              end: '2025/11/05@00:28:32',
              endInclusive: false,
              state: 'idle',
              numberOfResults: 0,
            },
            {
              start: '2025/11/04@00:28:32',
              end: '2025/11/05@00:28:32',
              endInclusive: false,
              state: 'idle',
              numberOfResults: 12,
            },
            {
              start: '2025/10/29@00:28:32',
              end: '2025/11/05@00:28:32',
              endInclusive: false,
              state: 'idle',
              numberOfResults: 85,
            },
            {
              start: '2025/10/05@00:28:32',
              end: '2025/11/05@00:28:32',
              endInclusive: false,
              state: 'idle',
              numberOfResults: 528,
            },
            {
              start: '2025/08/05@00:28:32',
              end: '2025/11/05@00:28:32',
              endInclusive: false,
              state: 'idle',
              numberOfResults: 2709,
            },
            {
              start: '2024/11/05@00:28:32',
              end: '2025/11/05@00:28:32',
              endInclusive: false,
              state: 'idle',
              numberOfResults: 13141,
            },
          ],
          indexScore: 0.1,
          domain: {
            start: '2007/05/11@14:39:46',
            end: '2025/11/04@22:22:14',
          },
        },
        {
          facetId: 'date_input_range',
          field: 'date',
          moreValuesAvailable: false,
          values: [
            {
              start: '2006/12/31@19:00:00',
              end: '2025/12/31@19:00:00',
              endInclusive: true,
              state: 'idle',
              numberOfResults: 62195,
            },
          ],
          indexScore: 0.1,
          domain: {
            start: '2007/05/11@14:39:46',
            end: '2025/11/04@22:22:14',
          },
        },
        {
          facetId: 'date_input',
          field: 'date',
          moreValuesAvailable: false,
          values: [],
          indexScore: 0.1,
          domain: {
            start: '2007/05/11@14:39:46',
            end: '2025/11/04@22:22:14',
          },
        },
      ],
    }));
  },
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
        {exact: false, timeout: 10e3}
      );
      button.ariaChecked === 'false' ? button.click() : null;
    });
  },
};
