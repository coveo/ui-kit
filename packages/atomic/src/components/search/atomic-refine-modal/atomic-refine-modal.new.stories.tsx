import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {expect} from 'storybook/test';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, styleTemplate} = getStorybookHelpers(
  'atomic-refine-modal',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-refine-modal',
  title: 'Search/Refine Modal',
  id: 'atomic-refine-modal',
  render: (args) =>
    html`${styleTemplate(args)}<atomic-refine-toggle></atomic-refine-toggle>`,
  decorators: [decorator],
  parameters: {
    ...commonParameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args: {
    ...args,
    'collapse-facets-after': '0',
  },
  argTypes: {
    ...argTypes,
    'open-button': {
      ...argTypes['open-button'],
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    'is-open': {
      ...argTypes['is-open'],
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    'collapse-facets-after': {
      ...argTypes['collapse-facets-after'],
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
  },
  globals: {
    layout: 'fullscreen',
    docs: {
      ...commonParameters.docs,
      story: {
        ...commonParameters.docs?.story,
        height: '1000px',
      },
    },
  },
  play: async (context) => {
    await play(context);
    const {canvasElement, canvas, step, userEvent} = context;
    const refineToggleElement = within(
      canvasElement.querySelector('atomic-refine-toggle')!
    );
    const refineToggleButton = await refineToggleElement.findByShadowRole(
      'button',
      {
        name: 'Sort & Filter',
      }
    );
    await step('Open refine modal', async () => {
      await userEvent.click(refineToggleButton);
      await expect(
        await canvas.findByShadowText(
          'Relevance',
          {exact: false},
          {timeout: 10e3}
        )
      ).toBeVisible();
    });
    // It's tough to wait exactly for the modal to be visible because of animations. Thus, we add a small delay here.
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
};

export default meta;

export const DefaultModal: Story = {
  name: 'Default modal',
};

export const NoResultsModal: Story = {
  name: 'No results modal',
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
  play,
};

export const FewResultsModal: Story = {
  name: 'Few results modal',
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 5),
      totalCount: 5,
      totalCountFiltered: 5,
    }));
  },
  play,
};
